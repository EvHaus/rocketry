// @flow strict

import {
	type ConfigType,
	type ServerCommandResponseType,
	type ServerType,
} from '../types/config';
import chalk from 'chalk';
import {Command} from 'commander';
import {getAppName} from './local';
import ora from 'ora';
import path from 'path';

const NVM_INSTALL_URL = 'https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh';

// Ensure target directory exists
export const ensureTargetDirectoryExists = async function (
	config: ConfigType,
	debug: (msg: string) => any,
	server: ServerType
): Promise<boolean> {
	const {target_dir} = config;

	const spinner = ora(
		`Ensuring target directory ${chalk.yellow(target_dir)} exists...`
	);

	try {
		await serverRun(`mkdir -p ${target_dir}`, debug, server);
	} catch (err) {
		spinner.fail('Failed to create target directory on server.');
		throw err;
	}

	spinner.succeed('Target directory exists.');
	return true;
};

// Installs apt package updates
export const installAptUpdates = async function (
	program: typeof Command,
	debug: (msg: string) => any,
	server: ServerType
) {
	const spinner = ora('Installing apt updates on target server...');
	if (!program.debug) spinner.start();

	const cmds = [
		`sudo apt-get update`,
		// curl and wget are needed for some servers which are barebones
		`sudo apt-get install -y curl unzip wget`,
		// DEBIAN_FRONTEND is needed here to force restart of services.
		// See: https://bugs.launchpad.net/ubuntu/+source/eglibc/+bug/935681
		`DEBIAN_FRONTEND=noninteractive sudo apt-get upgrade -y`,
		`sudo apt-get autoremove -y`,
	];

	try {
		await serverRunMultiple(cmds, debug, server);
	} catch (err) {
		spinner.fail(
			`${chalk.red('[FAILURE]')} Failed to install apt package upgrades.`
		);
		throw err;
	}

	spinner.succeed(
		`Latest apt package versions have been installed on target server.`
	);
};

// Installs node on the target server
export const installNode = async function (
	program: typeof Command,
	debug: (msg: string) => any,
	server: ServerType
) {
	const spinner = ora('Installing node on target server...');
	if (!program.debug) spinner.start();

	const cmds = [
		`wget -qO- ${NVM_INSTALL_URL} | bash`,
		`nvm install stable`,
		// Clean up
		`nvm cache clear`,
	];

	try {
		const {stderr} = await serverRunMultiple(cmds, debug, server);

		// Send all `stderr` as errors, we'll deal with them below
		if (stderr) throw new Error(stderr);
	} catch (err) {
		// This is just here for documentation. It doesn't actually do anything.
		if (
			// For some reason "already installed" responses are returned as
			// errors. We can ignore them.
			err.message.includes('is already installed') ||
			// For some reason `nvm` returns a successful upgrade as an error,
			// so we have to ignore it and not throw
			err.message.includes('Checksums matched!')
		) {
			// Do nothing
		}

		if (
			// Here we check to see if `nvm cache clear` worked or not. If it
			// didn't it means the nvm command wasn't properly installed.
			err.message.includes('nvm: command not found')
		) {
			spinner.fail(
				`${chalk.red('[FAILURE]')} Failed to install node on target server.`
			);
			throw err;
		}
	}

	spinner.succeed(
		`Latest version of node has been installed on target server.`
	);
};

export const installNpmDependencies = async function (
	config: ConfigType,
	debug: (msg: string) => any,
	program: typeof Command,
	server: ServerType
): Promise<boolean> {
	const spinner = ora('Installing npm dependencies...');
	if (!program.debug) spinner.start();

	const {target_dir} = config;

	try {
		await serverRunMultiple([
			`cd ${target_dir} && yarn install --pure-lockfile --ignore-optional`,
		], debug, server);
	} catch (err) {
		spinner.fail(
			`${chalk.red('[FAILURE]')} Failed to install npm dependencies.`
		);
		throw err;
	}

	spinner.succeed('All npm dependencies installed.');
	return true;
};

// Installs pm2 on the target server
export const installPm2 = async function (
	program: typeof Command,
	debug: (msg: string) => any,
	server: ServerType
) {
	const spinner = ora('Installing pm2 on target server...');
	if (!program.debug) spinner.start();

	const cmds = [
		'npm install pm2@latest -g',
		'pm2 update',
	];

	try {
		const {stderr} = await serverRunMultiple(cmds, debug, server);

		// In some cases, after `nvm` commands, the `npm` command cannot be
		// found. If this happens. Break out of the deployment early as we
		// cannot continue safely.
		if (stderr && stderr.includes('npm: command not found')) {
			throw new Error(stderr);
		}
	} catch (err) {
		spinner.fail(
			`${chalk.red('[FAILURE]')} Failed to install pm2 on target server.`
		);
		throw err;
	}

	spinner.succeed(
		`Latest version of pm2 has been installed on target server.`
	);
};

// Installs yarn on the target server
export const installYarn = async function (
	program: typeof Command,
	debug: (msg: string) => any,
	server: ServerType
) {
	const spinner = ora('Installing yarn on target server...');
	if (!program.debug) spinner.start();

	const cmds = [
		`curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | APT_KEY_DONT_WARN_ON_DANGEROUS_USAGE=1 sudo apt-key add -`,
		`echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list`,
		'sudo apt-get update',
		'sudo apt-get install -y yarn',
	];

	try {
		await serverRunMultiple(cmds, debug, server);
	} catch (err) {
		spinner.fail(
			`${chalk.red('[FAILURE]')} Failed to install yarn on target server.`
		);
		throw err;
	}

	spinner.succeed(
		`Latest version of yarn has been installed on target server.`
	);
};

// Restart services
export const restartServices = async function (
	program: typeof Command,
	config: ConfigType,
	debug: (msg: string) => any,
	server: ServerType
): Promise<boolean> {
	const spinner = ora('Restarting services...');
	if (!program.debug) spinner.start();

	const name = getAppName(config, program);
	let needsInitialStart = false;

	// Check to see if the application needs to be started for the first time,
	// or restarted.
	try {
		const {stderr} = await serverRun(`pm2 show ${name}`, debug, server);
		needsInitialStart = stderr.includes(`doesn't exist`);
	} catch (err) {
		console.error(chalk.red(err));
	}

	const cmds = [
		needsInitialStart ?
			`cd ${config.target_dir} && pm2 start npm --log-date-format 'YYYY-MM-DD HH:mm:ss.SSS' --name "${name}" -- start` :
			`pm2 restart ${name}`,
	];

	try {
		await serverRunMultiple(cmds, debug, server);
	} catch (err) {
		spinner.fail(
			`${chalk.red('[FAILURE]')} Failed to start ${name} service on ` +
			`target server.`
		);
		throw err;
	}

	spinner.succeed(`Service has been restarted.`);
	return true;
};

// Runs a single command on the target server
export const serverRun = async function (
	// Command to run
	cmd: string,
	// A ref to the "debug()" command for printing messages
	debug: (msg: string) => any,
	// A ref to the current server instance
	server: ServerType,
	// The working directory from which to run the command
	cwd?: ?string
): Promise<ServerCommandResponseType> {
	debug(chalk.cyan(cmd));

	const command = (
		// Source .nvm/nvm.sh before every command. Otherwise commands like
		// `node` and `npm` will fail with "npm: command not found". The || op
		// is used on purpose to errors from this command for cases where nvm
		// isn't installed yet. The "echo" is needed to ensure the right stdout
		// output is captured for the "--debug" option.
		`source ~/.nvm/nvm.sh || echo "" && ` +
		// Run `pwd` after each command can save it for the next command. The
		// braces are needed to ensure the right stdout output is captured.
		`${cmd} && pwd`
	);

	const result = await server.execCommand(command, {
		cwd,
		onStdout: (chunk: Buffer) => {
			debug(chunk.toString('utf8'));
		},
		onStderr: (chunk: Buffer) => {
			debug(chalk.red(chunk.toString('utf8')));
		},
	});

	// `pwd` output will be on the last line
	const responseLines = result.stdout.split('\n');
	const newCwd = responseLines[responseLines.length - 1];

	return {
		...result,
		cwd: newCwd,
	};
};

// Runs multiple commands on the target server
export const serverRunMultiple = function (
	// Commands to run
	cmds: Array<string>,
	// A ref to the "debug()" command for printing messages
	debug: (msg: string) => any,
	// A ref to the current server instance
	server: ServerType
): Promise<ServerCommandResponseType> {
	let cwd;
	let stdOuts = '';
	let stdErrs = '';

	// Chains promises serially
	return cmds.reduce((
		chain: Promise<ServerCommandResponseType>,
		cmd: string
	): Promise<ServerCommandResponseType> => {
		return chain.then(async (): Promise<ServerCommandResponseType> => {
			const cmdResponse = await serverRun(
				cmd,
				debug,
				server,
				cwd
			);

			// Concat all stderr and stdout commands together
			stdOuts = `${stdOuts}\n${cmdResponse.stdout}`;
			cmdResponse.stdout = stdOuts;
			stdErrs = `${stdErrs}\n${cmdResponse.stderr}`;
			cmdResponse.stderr = stdErrs;

			// eslint-disable-next-line require-atomic-updates
			cwd = cmdResponse.cwd;

			return cmdResponse;
		});
	}, Promise.resolve({
		code: -1,
		cwd: null,
		signal: null,
		stderr: '',
		stdout: '',
	}));
};

// Uploads the given zip file to the target server
export const uploadZipToServer = async function ({
	config,
	debug,
	localZipPath,
	program,
	server,
}: {
	config: ConfigType,
	debug: (msg: string) => any,
	localZipPath: string,
	program: typeof Command,
	server: ServerType,
}) {
	const spinner = ora(`Uploading ${chalk.yellow(localZipPath)} to server...`);
	if (!program.debug) spinner.start();

	const {target_dir} = config;
	const target = path.join(target_dir, 'rocketry.zip');

	try {
		await server.putFile(localZipPath, target, undefined, {
			// This setting is needed for some reason, otherwise some uploads will
			// hang in the middle of the operation and timeout. I have no idea why,
			// and there don't appear to be any issues about it on GitHub no either
			// node-ssh, or ssh2-streams. /shrug
			concurrency: 1,
			step: (total_transferred: number, chunk: number, total: number) => {
				// Show a progress bar
				const percTransferred = Math.round(total_transferred / total * 100);

				spinner.text = (
					`Uploading ${chalk.yellow(localZipPath)} to server (${percTransferred}%)...`
				);
			},
		});
	} catch (error) {
		spinner.fail(
			`${chalk.red('[FAILURE]')} Failed to upload ZIP package to target server.`
		);
		throw error;
	}

	// Unzip the package once its on the server
	spinner.text = (
		`Deployment package uploaded to '${chalk.yellow(target)}'. Unzipping...`
	);

	try {
		await serverRunMultiple([
			`cd ${target_dir}`,
			`unzip -ao ${target}`,
			`rm -f rocketry.zip`,
		], debug, server);
	} catch (error) {
		spinner.fail(
			`${chalk.red('[FAILURE]')} Failed to unzip uploaded package on the target server.`
		);
		throw error;
	}

	spinner.succeed('Package unzipped on the target server.');
};

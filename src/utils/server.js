// @flow

import {
	type ConfigType,
	type ServerCommandResponseType,
	type ServerType,
} from '../types/config';
import chalk from 'chalk';
import {type Command} from 'commander';
import ora from 'ora';

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
	program: Command,
	debug: (msg: string) => any,
	server: ServerType
) {
	const spinner = ora('Installing node on target server...');
	if (!program.verbose) spinner.start();

	const cmds = [
		`sudo apt-get update`,
		`sudo apt-get install -y unzip`,
		`sudo apt-get upgrade -y`,
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
	program: Command,
	debug: (msg: string) => any,
	server: ServerType
) {
	const spinner = ora('Installing node on target server...');
	if (!program.verbose) spinner.start();

	const cmds = [
		// TODO: This command isn't being waited on to be finished...
		`wget -qO- ${NVM_INSTALL_URL} | bash`,
		`source ~/.nvm/nvm.sh && nvm install stable`,
	];

	try {
		const {stderr} = await serverRunMultiple(cmds, debug, server);

		// For some reaosn "already installed" responses are returned as
		// errors. We can ignore them.
		if (stderr && stderr.includes('is already installed')) {
			// Do nothing
		} else if (stderr) {
			throw new Error(stderr);
		}
	} catch (err) {
		// For some reason `nvm` returns a successful upgrade as an error, so
		// we have to ignore it and not throw
		if (!String(err.message).contains('Checksums matched!')) {
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
	program: Command,
	server: ServerType
): Promise<boolean> {
	const spinner = ora('Installing npm dependencies...');
	if (!program.verbose) spinner.start();

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

// Installs yarn on the target server
export const installYarn = async function (
	program: Command,
	debug: (msg: string) => any,
	server: ServerType
) {
	const spinner = ora('Installing node on target server...');
	if (!program.verbose) spinner.start();

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
	program: Command,
	config: ConfigType,
	debug: (msg: string) => any,
	server: ServerType
): Promise<boolean> {
	const spinner = ora('Restarting services...');
	if (!program.verbose) spinner.start();

	// TODO: This doesn't wait for the install to finish
	const cmds = [
		// Start with: `pm2 start npm --name "yarn" -- start`
		`pm2 restart yarn`,
	];

	try {
		await serverRunMultiple(cmds, debug, server);
	} catch (err) {
		spinner.fail(
			`${chalk.red('[FAILURE]')} Failed to restart services on target server.`
		);
		throw err;
	}

	spinner.succeed(`Services have been restarted.`);
	return true;
};

// Runs a single command on the target server
export const serverRun = async function (
	cmd: string,
	debug: (msg: string) => any,
	server: ServerType,
	cwd?: ?string
): Promise<ServerCommandResponseType> {
	debug(chalk.cyan(cmd));

	// Run `pwd` after each command can save it for the next command
	const command = `${cmd} && pwd`;

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
	cmds: Array<string>,
	debug: (msg: string) => any,
	server: ServerType
): Promise<ServerCommandResponseType> {
	let cwd;

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
}: {|
	config: ConfigType,
	debug: (msg: string) => any,
	localZipPath: string,
	program: Command,
	server: ServerType,
|}) {
	const spinner = ora(`Uploading ${chalk.yellow(localZipPath)} to server...`);
	if (!program.verbose) spinner.start();

	const {target_dir} = config;
	const target = `${target_dir}/deploy.zip`;

	await server.putFile(localZipPath, target);

	// Unzip the package once its on the server
	spinner.text = (
		`Deployment package uploaded to '${chalk.yellow(target)}'. Unzipping...`
	);

	try {
		await serverRunMultiple([
			`cd ${target_dir}`,
			`unzip -ao ${target}`,
			`rm -f deploy.zip`,
		], debug, server);
	} catch (error) {
		spinner.fail(
			`${chalk.red('[FAILURE]')} Failed to upload ZIP package to target server.`
		);
		throw error;
	}

	spinner.succeed('Package unzipped on the target server.');
};

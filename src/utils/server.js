// @flow

import {type CmdResponseType, type ConfigType} from '../types/config';
import chalk from 'chalk';
import {Client} from 'ssh2';
import {type Command} from 'commander';
import ora from 'ora';

const NVM_INSTALL_URL = 'https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh';

// Ensure target directory exists
export const ensureTargetDirectoryExists = async function (
	config: ConfigType,
	debug: (msg: string) => any,
	server: Client
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
	server: Client
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
	server: Client
) {
	const spinner = ora('Installing node on target server...');
	if (!program.verbose) spinner.start();

	const cmds = [
		// TODO: This command isn't being waited on to be finished...
		`wget -qO- ${NVM_INSTALL_URL} | bash`,
		`source ~/.nvm/nvm.sh && nvm install stable`,
	];

	try {
		const stderr: ?string = (await serverRunMultiple(cmds, debug, server))[1];

		// For some reaosn "already installed" responses are returned as
		// errors. We can ignore them.
		if (stderr && stderr.includes('is already installed')) {
			// Do nothing
		} else if (stderr) {
			throw new Error(stderr);
		}
	} catch (err) {
		spinner.fail(
			`${chalk.red('[FAILURE]')} Failed to install node on target server.`
		);
		throw err;
	}

	spinner.succeed(
		`Latest version of node has been installed on target server.`
	);
};

export const installNpmDependencies = async function (
	config: ConfigType,
	debug: (msg: string) => any,
	program: Command,
	server: Client
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
	server: Client
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
	server: Client
): Promise<boolean> {
	const spinner = ora('Restarting services...');
	if (!program.verbose) spinner.start();

	const {target_dir} = config;

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
export const serverRun = function (
	cmd: string,
	debug: (msg: string) => any,
	server: Client
): Promise<CmdResponseType> {
	debug(chalk.cyan(cmd));

	return new Promise((resolve: (CmdResponseType) => any) => {
		const response: CmdResponseType = [null, null];
		server.exec(cmd, (err: Buffer, stream: any): any => {
			if (err) {
				response[1] = err.toString();
				resolve(response);
				return;
			}

			stream
				.on('close', (stdout: string | number): any => {
					// Empty stdout values are returned as 0
					if (stdout !== 0) {
						if (!response[0]) response[0] = '';
						if (response[0]) response[0] += `\n${stdout}`;
						resolve(response);
					}

					return resolve(response);
				})
				.on('data', (data: string) => {
					if (!response[0]) response[0] = '';
					if (response[0]) response[0] += `\n${data}`;
					debug(data);
				})
				.stderr.on('data', (data: string) => {
					debug(data);
					response[1] = data.toString();
					resolve(response);
				});
		});
	});
};

// Runs multiple commands on the target server
export const serverRunMultiple = function (
	cmds: Array<string>,
	debug: (msg: string) => any,
	server: Client
): Promise<CmdResponseType> {
	const response: CmdResponseType = [null, null];

	// Chains promises serially
	return cmds.reduce((
		chain: Promise<CmdResponseType>,
		cmd: string
	): Promise<CmdResponseType> => {
		return chain.then(async (): Promise<CmdResponseType> => {
			const cmdResponse = await serverRun(
				cmd,
				debug,
				server
			);

			// Combine all the response values
			if (cmdResponse[0] && !response[0]) {
				response[0] = cmdResponse[0];
			} else if (cmdResponse[0] && response[0]) {
				response[0] += `\n${response[0]}`;
			}

			if (cmdResponse[1] && !response[1]) {
				response[1] = cmdResponse[1];
			} else if (cmdResponse[1] && response[1]) {
				response[1] += `\n${response[1]}`;
			}

			return response;
		});
	}, Promise.resolve([null, null]));
};

// Uploads the given zip file to the target server
export const uploadZipToServer = function ({
	config,
	debug,
	localZipPath,
	program,
	server,
}: {
	config: ConfigType,
	debug: (msg: string) => any,
	localZipPath: string,
	program: Command,
	server: Client,
}): Promise<void> {
	return new Promise((
		resolve: () => void,
		reject: (err: Error) => void
	) => {
		const spinner = ora(`Uploading ${chalk.yellow(localZipPath)} to server...`);
		if (!program.verbose) spinner.start();

		server.sftp((err: Error, sftp: any) => {
			if (err) throw err;
			const {target_dir} = config;
			const target = `${target_dir}/deploy.zip`;
			sftp.fastPut(localZipPath, target, async () => {
				// Untar the package once its on the server
				spinner.text = (
					`Deployment package uploaded to ` +
					`'${chalk.yellow(target)}'. Unzipping...`
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
				resolve();
			}, (err: Error): any => reject);
		});
	});
};

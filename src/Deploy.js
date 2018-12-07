// @flow

import {
	ensureTargetDirectoryExists,
	installAptUpdates,
	installNode,
	installNpmDependencies,
	installYarn,
	restartServices,
	uploadZipToServer,
} from './utils/server';
import {
	getPrivateKey,
	getSources,
	zipUpCurrentDirectory,
} from './utils/local';
import chalk from 'chalk';
import {Client} from 'ssh2';
import {type Command} from 'commander';
import {type ConfigType} from './types/config';
import inquirer from 'inquirer';
import ora from 'ora';

class Deploy {
	_sshPassword: string;

	config: ConfigType;

	program: Command;

	server: ?Client;

	constructor (config: ConfigType, program: Command) {
		this.config = config;
		this.program = program;
		this.run();
	}

	// Ask the user for the password to unlock their private SSH key
	async askForPassword () {
		const result = await inquirer.prompt<{password: string}>([{
			message: 'What is your private SSH key passphrase?',
			name: 'password',
			type: 'password',
		}]);

		this._sshPassword = result.password;
	}

	// Connects to the target server
	connectToServer (): Promise<Client> {
		const {host, user} = this.config;

		const spinner = ora(`Connecting to ${chalk.yellow(host)}...`).start();

		const privateKey = getPrivateKey(this.config.private_key_path);

		return new Promise((
			resolve: (client: Client) => any,
			reject: (err: Error) => any
		) => {
			const client = new Client();
			client
				.on('ready', (): any => resolve(client))
				.on('error', (err: Error) => {
					// This is error you get when connection to server fails
					if (err && err.message === 'All configured authentication methods failed') {
						reject(new Error(
							`Unable to connect to remote server ${host}. ` +
							`Error: ${err.message}.`
						));
					} else {
						reject(err);
					}
				})
				.connect({
					host,
					username: user,
					privateKey,
					passphrase: this._sshPassword,
				});
		}).then((client: Client): Client => {
			spinner.succeed(`Connected to ${chalk.yellow(host)}`);
			return client;
		}).catch((err: Error) => {
			spinner.fail(
				`${chalk.red('[FAILURE]')} Could not connect to remote server.`
			);

			// This is what ssh2 returns when the password isn't right
			if (err && err.message.includes('Cannot parse privateKey')) {
				throw new Error(
					`Wrong private SSH key password provided.`
				);
			}

			throw err;
		});
	}

	debug = (msg: string) => {
		// eslint-disable-next-line no-console
		if (this.program.verbose) console.debug(chalk.gray(msg));
	};

	// The main run function
	async run (): Promise<void> {
		this.debug(`Executing 'run' command...`);

		try {
			await this.askForPassword();
			this.server = await this.connectToServer();

			await installAptUpdates(this.program, this.debug, this.server);
			await installNode(this.program, this.debug, this.server);
			await installYarn(this.program, this.debug, this.server);

			await ensureTargetDirectoryExists(this.config, this.debug, this.server);
			const sources = await getSources(this.config, this.debug, this.program);
			const zipPath = await zipUpCurrentDirectory(sources, this.program);
			await uploadZipToServer({
				config: this.config,
				debug: this.debug,
				localZipPath: zipPath,
				program: this.program,
				server: this.server,
			});

			await installNpmDependencies(this.config, this.debug, this.program, this.server);
			await restartServices(this.program, this.config, this.debug, this.server);

			// Quit after we're done
			return process.exit(0);
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error(chalk.red(err.message));

			// Close the server connection
			if (this.server) this.server.end();

			return process.exit(1);
		}
	}
}

export default Deploy;

#!/usr/bin/env node
// @flow strict

import chalk from 'chalk';
import {type ConfigType} from './types/config';
import {cosmiconfig} from 'cosmiconfig';
import Joi from '@hapi/joi';
import path from 'path';
import pkg from '../package';
import program from 'commander';
import Rocketry from './Rocketry';

// Define global CLI options
program
	.version(pkg.version)
	.option(
		'-D, --dir <path>',
		'Path to the directory you want to run your deployment from. Defaults to process.cwd().',
		process.cwd()
	)
	.option('-d, --debug', 'Show verbose debug messages')
	.parse(process.argv);

// Define config schema
const configSchema = Joi.object({
	host: Joi.string()
		.ip()
		.required()
		.error(new Error(`The 'host' configuration value must be a valid IP and cannot be empty`)),
	name: Joi.string(),
	private_key_path: Joi.string()
		// eslint-disable-next-line no-process-env
		.default(path.resolve(process.env.HOME || '~', '.ssh', 'id_rsa'))
		.error(new Error(`The 'private_key_path' configuration value must be a string and cannot be empty`)),
	sources: Joi.array()
		.items(Joi.string())
		.error(new Error(`The 'sources' configuration value must be an array of file paths and cannot be empty`)),
	target_dir: Joi.string()
		.required()
		.error(new Error(`The 'target_dir' configuration value must be a string and cannot be empty`)),
	user: Joi.string()
		.default('root')
		.error(new Error(`The 'user' configuration value must be a string and cannot be empty`)),
});

const explorer = cosmiconfig('rocketry');

export const onConfigLoad = ({
	config,
	filepath,
	isEmpty,
}: {
	config: ConfigType,
	filepath: string,
	isEmpty: boolean,
}): ?{
	config: ConfigType,
	program: any,
} => {
	if (isEmpty) return console.error(chalk.red(
		`Configuration file ${filepath} is empty. Can't proceed.`
	));

	// Validate configuration
	const parsedConfig = configSchema.validate(config);

	if (parsedConfig.error) {
		console.error(chalk.red(
			`You have an error in your '${filepath}' configuration file:\n` +
			`${parsedConfig.error.message}.`
		));
		return undefined;
	}

	program
		.command('run')
		.description('Perform a production deployment')
		.action(() => {
			const r = new Rocketry(parsedConfig.value, program);
			r.run();
		});

	program
		.command('version')
		.description('Prints the current version of `rocketry`')
		.action((): any => console.log(pkg.version));

	// Warn about commands we don't support
	program
		.command('*')
		.action((cmd: string) => {
			console.error(chalk.red(`'${cmd}' is not a valid \`rocketry\` command.`));
		});

	// Warn about missing commands
	if (!program.args || !program.args.length) {
		console.error(chalk.red(`No commands specified. Try 'rocketry run' instead.`));
	}

	return {
		config: parsedConfig.value,
		program: program.parse(process.argv),
	};
};

export const onConfigLoadError = (error: Error) => {
	console.error(chalk.red(
		`Unexpected error occured: ${error.message}`
	));
};

// Search for a configuration by walking up directories.
// See documentation for search, below.
explorer.search(program.dir)
	.then(onConfigLoad)
	.catch(onConfigLoadError);

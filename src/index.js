#!/usr/bin/env node
// @flow

import chalk from 'chalk';
import {type ConfigType} from './types/config';
import cosmiconfig from 'cosmiconfig';
import joi from '@hapi/joi';
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
const configSchema = joi.object().keys({
	host: joi.string()
		.ip()
		.required()
		.error(new Error(`The 'host' configuration value must be a valid IP and cannot be empty`)),
	name: joi.string(),
	private_key_path: joi.string()
		.error(new Error(`The 'private_key_path' configuration value must be a string and cannot be empty`)),
	sources: joi.array()
		.items(joi.string())
		.error(new Error(`The 'sources' configuration value must be an array of file paths and cannot be empty`)),
	target_dir: joi.string()
		.required()
		.error(new Error(`The 'target_dir' configuration value must be a string and cannot be empty`)),
	user: joi.string()
		.required()
		.error(new Error(`The 'user' configuration value must be a string and cannot be empty`)),
});

const explorer = cosmiconfig('rocketry');

// Search for a configuration by walking up directories.
// See documentation for search, below.
explorer.search(program.dir)
	.then(({
		config,
		filepath,
		isEmpty,
	}: {
		config: ConfigType,
		filepath: string,
		isEmpty: boolean,
	}): any => {
		if (isEmpty) return console.error(chalk.red(
			`Configuration file ${filepath} is empty. Can't proceed.`
		));

		// Validate configuration
		const result = joi.validate(config, configSchema);

		if (result.error) return console.error(chalk.red(
			`You have an error in your '${filepath}' configuration file:\n` +
			`${result.error.message}.`
		));

		program
			.command('run')
			.description('Perform a production deployment')
			.action((): any => new Rocketry(config, program));

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

		return program.parse(process.argv);
	})
	.catch((error: Error) => {
		console.error(chalk.red(
			`Unexpected error occured: ${error.message}`
		));
	});

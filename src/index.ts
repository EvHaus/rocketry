#!/usr/bin/env node

import chalk from 'chalk';
import {ConfigType} from './types/config';
import cosmiconfig from 'cosmiconfig';
import joi from 'joi';
import program from 'commander';
import pkg from '../package.json';
import Run from './run';

// Define global CLI options
program
	.version(pkg.version)
	.option('-v, --verbose', 'Show verbose debug messages')
	.parse(process.argv);

// Define config schema
const configSchema = joi.object().keys({
	host: joi.string()
		.ip()
		.required()
		.error(new Error(`The 'host' configuration value must be a valid IP and cannot be empty`)),
	private_key_path: joi.string()
		.required()
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

const explorer = cosmiconfig('deploy');

// Search for a configuration by walking up directories.
// See documentation for search, below.
explorer.search()
	.then(({
		config,
		filepath,
		isEmpty
	}: {
		config: ConfigType,
		filepath: string,
		isEmpty: boolean
	}): any => {
		if (isEmpty) return console.error(chalk.red(
			`Configuration file ${filepath} is empty. Can't proceed.`
		));

		// Validate configuration
		const result = joi.validate(config, configSchema);
		if (result.error) return console.error(chalk.red(
			result.error.message
		));

		program
			.command('run')
			.description('Perform a production deployment')
			.action(() => new Run(config, program));

		// Warn about commands we don't support
		program
			.command('*')
			.action((cmd) => {
				console.error(chalk.red(`'${cmd}' is not a valid command.`));
			});

		// Warn about missing commands
		if (!program.args.length) {
			console.error(chalk.red(`No commands specified. Try 'deploy run' instead.`));
		}

		return program.parse(process.argv);
	})
	.catch((error) => console.error(chalk.red(
		`Unexpected error occured: ${error.message}`
	)));

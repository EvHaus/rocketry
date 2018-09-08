#!/usr/bin/env node

const chalk = require('chalk');
const cosmiconfig = require('cosmiconfig');
const joi = require('joi');
const program = require('commander');
const pkg = require('../package.json');

// Define CLI commands
program
	.version(pkg.version)
	.option('-d, --debug', 'Show verbose debug messages')
	.parse(process.argv);

// Define config schema
const configSchema = joi.object().keys({
	directories: joi.array()
		.items(joi.string())
		.error(new Error(`The 'directories' configuration value must be an array of file paths and cannot be empty`)),
	files: joi.array()
		.items(joi.string())
		.error(new Error(`The 'files' configuration value must be an array of file paths and cannot be empty`)),
	host: joi.string()
		.ip()
		.required()
		.error(new Error(`The 'host' configuration value must be a valid IP and cannot be empty`)),
	private_key_path: joi.string()
		.required()
		.error(new Error(`The 'private_key_path' configuration value must be a string and cannot be empty`)),
	target_dir: joi.string()
		.required()
		.error(new Error(`The 'target_dir' configuration value must be a string and cannot be empty`)),
	user: joi.string()
		.required()
		.error(new Error(`The 'user' configuration value must be a string and cannot be empty`)),
}).or(['directories', 'files']);

const explorer = cosmiconfig('deploy');

// Search for a configuration by walking up directories.
// See documentation for search, below.
explorer.search()
	.then(({config, filepath, isEmpty}) => {
		if (isEmpty) return console.error(chalk.red(
			`Configuration file ${filepath} is empty. Can't proceed.`
		));

		// Validate configuration
		const result = joi.validate(config, configSchema);

		if (result.error) {
			return console.error(chalk.red(result.error.message));
		}

		return console.log('READY TO DO STUFF');
	})
	.catch((error) => {
		console.error(chalk.red(
			'Unable to find configuration file. Did you create a .deployrc?'
		));
	});

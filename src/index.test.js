/* eslint-disable global-require */

import chalk from 'chalk';
import program from 'commander';

describe('index', () => {
	it('should setup commander with the right version', () => {
		spyOn(console, 'error');
		require('./index');
		expect(program.version).toHaveBeenCalledWith(jasmine.any(String));
	});

	it('should register the "--dir" option', () => {
		spyOn(console, 'error');
		require('./index');
		expect(program.option).toHaveBeenCalledWith(
			'-D, --dir <path>',
			jasmine.any(String),
			jasmine.any(String)
		);
	});

	it('should register the "--debug" option', () => {
		spyOn(console, 'error');
		require('./index');
		expect(program.option).toHaveBeenCalledWith(
			'-d, --debug',
			jasmine.any(String)
		);
	});

	it('should handle unexpected config load errors gracefully', () => {
		const consoleSpy = spyOn(console, 'error');
		const {onConfigLoadError} = require('./index');
		onConfigLoadError(new Error('failure'));
		expect(consoleSpy).toHaveBeenCalledWith(
			chalk.red('Unexpected error occured: failure')
		);
	});

	it('should handle empty configs gracefully', () => {
		const consoleSpy = spyOn(console, 'error');
		const {onConfigLoad} = require('./index');
		onConfigLoad({config: null, filepath: 'filepath', isEmpty: true});
		expect(consoleSpy).toHaveBeenCalledWith(
			chalk.red(`Configuration file filepath is empty. Can't proceed.`)
		);
	});

	it('should handle config validation errors gracefully', () => {
		const consoleSpy = spyOn(console, 'error');
		const {onConfigLoad} = require('./index');
		onConfigLoad({config: {}, filepath: 'filepath', isEmpty: false});
		expect(consoleSpy).toHaveBeenCalledWith(
			expect.stringContaining(`You have an error in your 'filepath' configuration file`)
		);
	});

	it('should expect a valid command if given a valid configuration file', () => {
		const consoleSpy = spyOn(console, 'error');
		const {onConfigLoad} = require('./index');
		const config = {
			host: '24.1.2.3',
			target_dir: '/var/www/',
			user: 'user',
		};
		onConfigLoad({config, filepath: 'filepath', isEmpty: false});
		expect(consoleSpy).toHaveBeenCalledWith(
			expect.stringContaining(`No commands specified.`)
		);
	});
});

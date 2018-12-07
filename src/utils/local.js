// @flow

import archiver from 'archiver';
import chalk from 'chalk';
import {type Command} from 'commander';
import {type ConfigType} from '../types/config';
import fs from 'fs';
import glob from 'glob';
import ora from 'ora';
import path from 'path';

// Given a path to a private SSH key file, returns its value
export const getPrivateKey = function (
	private_key_path: string
): string | Buffer {
	try {
		return fs.readFileSync(private_key_path);
	} catch (err) {
		throw new Error(
			`Can't find private SSH key in ${chalk.yellow(private_key_path)}. ` +
			`Make sure you're running this script via Bash.`
		);
	}
};

// Finds a list of directories and files that will be uploaded
export const getSources = async function (
	config: ConfigType,
	debug: (msg: string) => any,
	program: Command
): Promise<Array<string>> {
	const spinner = ora('Compiling a list of source files...');
	if (!program.verbose) spinner.start();

	try {
		const responses: Array<Array<string>> = await Promise.all(
			config.sources.map((
				sourceGlob: string
			): Promise<Array<string>> => {
				return new Promise((
					resolve: (files: Array<string>) => any,
					reject: (err: Error) => any
				) => {
					glob(sourceGlob, {
						cwd: program.dir,
						realpath: true,
					}, (
						err: ?Error,
						files: Array<string>
					): any => {
						if (err) {
							debug(`Source scan failed: ${err.message}`);
							return reject(err);
						}
						return resolve(files);
					});
				});
			})
		);

		const sources = responses.reduce((
			items: Array<string>,
			result: Array<string>
		): Array<string> => (
			result.concat(items)
		), []);

		spinner.succeed(`Found ${sources.length} source items.`);

		debug(
			`The following sources will be uploaded:\n` +
			`${sources.join('\n')}`
		);

		return sources;
	} catch (err) {
		spinner.fail(`Source scan failed: ${err.message}`);
		throw err;
	}
};

// Creates a ZIP of the current directory
export const zipUpCurrentDirectory = function (
	sources: Array<string>,
	program: Command
): Promise<string> {
	const dir = path.resolve(process.cwd(), program.dir);

	return new Promise((
		resolve: (zipPath: any) => void,
		reject: (err: Error) => void
	) => {
		const spinner = ora('Creating deployment archive...');
		if (!program.verbose) spinner.start();

		const outputPath = path.join(dir, 'deploy.zip');
		const output = fs.createWriteStream(outputPath);
		const archive = archiver('zip');

		output.on('close', () => {
			spinner.succeed('Deployment package created.');
			resolve(outputPath);
		});

		archive.on('error', reject);
		archive.pipe(output);

		// Add the files and directories to the ZIP archive
		for (let i = 0, l = sources.length; i < l; i++) {
			if (fs.lstatSync(sources[i]).isDirectory()) {
				const dirName = sources[i].replace(dir, '');
				archive.directory(sources[i], dirName);
			} else {
				const fileName = sources[i].replace(dir, '');
				archive.file(sources[i], {name: fileName});
			}
		}

		archive.finalize();
	});
};

export default null;

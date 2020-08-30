// @flow strict

import archiver from 'archiver';
import chalk from 'chalk';
import {Command} from 'commander';
import {type ConfigType} from '../types/config';
import fs from 'fs';
import glob from 'glob';
import ora from 'ora';
import path from 'path';
import {promisify} from 'util';

export const cwd = function (
	program: typeof Command
): string {
	return program.dir ? path.resolve(process.cwd(), program.dir) : process.cwd();
};

// Delete the deploy file
export const deleteZipFile = function (
	program: typeof Command
): Promise<void> {
	const deleteFile = promisify(fs.unlink);
	const outputPath = getZipFilePath(program);
	return deleteFile(outputPath);
};

// Determines the application's name
export const getAppName = function (
	config: ConfigType,
	program: typeof Command
): string {
	// If the config has a name - use that
	if (config.name) return config.name;

	// Otherwise grab the name from the `package.json` of the local dir
	const pkg = fs.readFileSync(path.join(cwd(program), 'package.json'));

	return (JSON.parse(String(pkg)) || {}).name;
};

// Gets the path to the deployment zip file
export const getZipFilePath = function (
	program: typeof Command
): string {
	return path.join(cwd(program), 'rocketry.zip');
};

// Finds a list of directories and files that will be uploaded
export const getSources = async function (
	config: ConfigType,
	debug: (msg: string) => any,
	program: typeof Command
): Promise<Array<string>> {
	const spinner = ora('Compiling a list of source files...');
	if (!program.debug) spinner.start();

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
						cwd: cwd(program),
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

// Given a path to a private SSH key file, returns its value
export const validatePrivateKeyPath = function (
	filePath: string
) {
	try {
		fs.readFileSync(filePath);
	} catch (err) {
		throw new Error(
			`Can't find private SSH key in ${chalk.yellow(filePath)}.`
		);
	}
};

// Creates a ZIP of the current directory
export const zipUpCurrentDirectory = function (
	sources: Array<string>,
	program: typeof Command
): Promise<string> {
	const dir = cwd(program);

	return new Promise((
		resolve: (zipPath: any) => void,
		reject: (err: Error) => void
	) => {
		const spinner = ora('Creating deployment archive...');
		if (!program.debug) spinner.start();

		const outputPath = getZipFilePath(program);
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

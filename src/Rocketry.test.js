/* eslint-disable node/no-process-env */

import chalk from 'chalk';
import {nodeSSHConnect} from 'node-ssh';
import program from 'commander';
import Rocketry from './Rocketry';

describe('rocketry', () => {
	const config = {host: '1.2.3.4'};

	it('should be a class', () => {
		expect(typeof Rocketry).toEqual('function');
	});

	it('should store the given config and program as class properties', () => {
		const r = new Rocketry(config, program);
		expect(r.config).toEqual(config);
		expect(r.program).toEqual(program);
	});

	describe('askSshPassword', () => {
		it('should prompt the user for a password and save it as a class property', async () => {
			const r = new Rocketry(config, program);
			await r.askSshPassword();
			expect(r._sshPassword).toEqual('given value');
		});
	});

	describe('connectToServer', () => {
		it('should return a Promise', () => {
			const r = new Rocketry(config, program);
			expect(r.connectToServer() instanceof Promise).toEqual(true);
		});

		it('should attempt connection via SSH key by default', async () => {
			const r = new Rocketry(config, program);
			await r.connectToServer();

			expect(nodeSSHConnect).toHaveBeenCalledWith({
				host: '1.2.3.4',
				passphase: undefined,
				privateKey: undefined,
				username: undefined,
			});
		});

		it('should connect via password (base64 encoded) when ROCKETRY_PW env variable is provided', async () => {
			process.env.ROCKETRY_PW = Buffer.from('some_password').toString('base64');

			const r = new Rocketry(config, program);
			await r.connectToServer();

			expect(nodeSSHConnect).toHaveBeenCalledWith({
				host: '1.2.3.4',
				password: 'some_password',
				username: undefined,
			});

			delete process.env.ROCKETRY_PW;
		});
	});

	describe('debug', () => {
		it('should print a debug message', () => {
			const consoleSpy = jest.spyOn(console, 'debug');
			const msg = 'Some message';
			const r = new Rocketry(config, {...program, debug: true});
			r.debug(msg);
			expect(consoleSpy).toHaveBeenCalledWith(chalk.gray(msg));
		});
	});
});

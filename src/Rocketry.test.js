import chalk from 'chalk';
import program from 'commander';
import Rocketry from './Rocketry';

describe('Rocketry', () => {
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
		it('should return a Promise', async () => {
			let error;
			const r = new Rocketry(config, program);
			try {
				await r.connectToServer();
			} catch (err) {
				error = err.message;
			}
			expect(error).toEqual('Invalid username');
		});
	});

	describe('debug', () => {
		it('should print a debug message', () => {
			const consoleSpy = spyOn(console, 'debug');
			const msg = 'Some message';
			const r = new Rocketry(config, {...program, debug: true});
			r.debug(msg);
			expect(consoleSpy).toHaveBeenCalledWith(chalk.gray(msg));
		});
	});
});

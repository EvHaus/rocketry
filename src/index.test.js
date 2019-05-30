import './index';
import program from 'commander';

describe('index', () => {
	it('should setup commander with the right version', () => {
		expect(program.version).toHaveBeenCalledWith(jasmine.any(String));
	});

	it('should register the "--dir" option', () => {
		expect(program.option).toHaveBeenCalledWith(
			'-D, --dir <path>',
			jasmine.any(String),
			jasmine.any(String)
		);
	});

	it('should register the "--verbose" option', () => {
		expect(program.option).toHaveBeenCalledWith(
			'-v, --verbose',
			jasmine.any(String)
		);
	});
});

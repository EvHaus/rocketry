const inquirer = {
	prompt: jest.fn((values) => {
		return Promise.resolve({
			[values[0].name]: 'given value',
		});
	}),
};

export default inquirer;

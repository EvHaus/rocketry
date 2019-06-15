const commander = {
	action: jest.fn(() => commander),
	command: jest.fn(() => commander),
	description: jest.fn(() => commander),
	option: jest.fn(() => commander),
	parse: jest.fn(() => commander),
	version: jest.fn(() => commander),
};

export default commander;

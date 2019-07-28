const ora = jest.fn().mockImplementation(() => {
	const val = {
		fail: jest.fn(() => val),
		start: jest.fn(() => val),
		succeed: jest.fn(() => val),
	};

	return val;
});

export default ora;

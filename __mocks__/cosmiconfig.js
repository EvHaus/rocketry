export const cosmiconfig = jest.fn().mockImplementation(() => {
	return {
		search: jest.fn(() => Promise.resolve({
			config: {
				host: '1.1.1.1',
				private_key_path: '/some/path',
				target_dir: '/var/www/',
				user: 'test',
			},
			filepath: '',
			isEmpty: false,
		})),
	};
});

export default null;

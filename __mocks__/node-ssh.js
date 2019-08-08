/* eslint-disable filenames/match-exported */

export const nodeSSHConnect = jest.fn(() => Promise.resolve());

const nodeSSH = jest.fn().mockImplementation(() => {
	return {
		connect: nodeSSHConnect,
	};
});

export default nodeSSH;

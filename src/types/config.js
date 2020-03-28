// @flow strict

import nodeSSH from 'node-ssh';

export type ConfigType = {
	host: string,
	name?: ?string,
	private_key_path: string,
	sources: Array<string>,
	target_dir: string,
	user: string,
};

export type ServerCommandResponseType = {
	...$Exact<SshCommandResponseType>,
	cwd: ?string,
};

export type ServerType = typeof nodeSSH;

export type SshCommandResponseType = {
	code: number,
	signal: ?string,
	stderr: string,
	stdout: string,
};

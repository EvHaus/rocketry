# Rocketry Documentation

## Table of Contents

- [**Quick Start**](#quick-start)
	- [Installation](#installation)
	- [Configuration](#configuration)
	- [Authentication](#authentication)
		- [Via Username & Password](#auth-user-password)
		- [Via SSH key pairs](#auth-ssh)
	- [Test a Manual Deployment](#manual-deployment)
- [**Documentation**](#documentation)
	- [Commands](#commands)
	- [Configuration Keys](#configuration-keys)

## 🏃🏼‍ Quick Start
<a name="quick-start" />

### Installation
<a name="installation" />

To get started, add `rocketry` as a dev dependency:

```sh
# With npm
npm install -D rocketry

# or

# With yarn
yarn add -D rocketry
```

### Configuration
<a name="configuration" />

To configure `rocketry` create a `.rocketryrc` file at the root of your project with the following required keys filled out:

```js
// .rocketryrc

{
	// Your target server's IP address here.
	host: '0.0.0.0',
	// Define an array of files and/or folders that you want to upload to the
	// server. Do not add `node_modules` here. They will be configured
	// automatically for you.
	sources: [
		'some_directory',
		'package.json',
		'start.js'
	],
	// Specify where on the target server you want your files to be placed.
	// Somewhere in /var/www/ is a good place if you can't decide.
	target_dir: '/var/www/example',
	// Specify what user should be used to connect to the server via SSH.
	user: 'root'
}
```

### Authentication
<a name="authentication" />

Authentication with your server is the only tricky part of working with `rocketry`. There are two ways to handle authentication: via username & password, or via an SSH key pair.

#### Via Username & Password
<a name="auth-user-password" />

> **NOTE:** When using username/password authentication, your password is assumed to be base64 encoded. This is done deliberately for security reasons.

To authenticate a deployment via a username and password, ensure the `user` configuration key is set in your `.rocketryrc` file, and pass the password to your `rocketry run` command via the `ROCKETRY_PW` environment variable, like this:

```sh
ROCKETRY_PW=yourBase64EncodedPasswordHere npx rocketry run
```

#### Via SSH key pairs
<a name="auth-ssh" />

To authenticate a deployment via an SSH key, specify the `private_key_path` configuration key in your `.rocketryrc` file. You'll be prompted to enter your private key passphrase when you run:

```sh
npx rocketry run
```

### Test a Manual Deployment
<a name="manual-deployment" />

Now that you've got `rocketry` configured, all you need to do is run:

```sh
# With npm
npx rocketry run

# or

# With yarn
yarn rocketry run
```

You can add the `--debug` flag to the end of that command to see detailed output of exactly what `rocketry` is doing.

## 📝 Documentation
<a name="documentation" />

### Commands
<a name="commands" />

The following `rocketry` commands are supported:

- `rocketry run`: Perform a production deployment
- `rocketry version`: Prints the current version of `rocketry`

### Configuration Keys
<a name="configuration-keys" />

Configuration is done via [`cosmiconfig`](https://github.com/davidtheclark/cosmiconfig) which allows `rocketry` to be configured via:

- a `package.json` `rocketry` property, or
- a `.rocketryrc` file, or
- a `.rocketryrc.js` file, or
- a `rocketry.config.js` file

The following configuration keys are supported:

**Required Keys**

- `host`: The IP address of the server you will be deploying to.
- `sources`: An array of file and folder paths (using [`glob`](https://github.com/isaacs/node-glob) syntax) that you want uploaded to your server.
- `target_dir`: The path to the target directory on the server where you want your application deployed.
- `user`: The name of the SSH `user` to use to authenticate with the server.

**Optional Keys**

- `name`: The name of your application (used in the `pm2` configuration). By default, the "name" value from your "package.json" will be used.
- `private_key_path`: The path to your local private SSH key file which will be used to authenticate with the server.

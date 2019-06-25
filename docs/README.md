# Documentation

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Test a Manual Deployment](#manual-deployment)

## Installation
<a name="installation" />

To get started, add `rocketry` as a dev dependency:

```sh
# With npm
npm install -D stylelint-config-globex

# or

# With yarn
yarn add -D stylelint-config-globex
```

### Configuration
<a name="configuration" />

To configure `rocketry` create a `.rocketryrc` file at the root of your project with the following required fields filled out:

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

### Test a Manual Deployment
<a name="manual-deployment" />

Now that you've got `rocketry` configured, all you need to do is run:

```sh
# With npm
npx run rocketry run

# or

# With yarn
yarn rocketry run
```

You can add the `--debug` flag to the end of that command to see detailed output of exactly what `rocketry` is doing.

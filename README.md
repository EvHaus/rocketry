<div align="center">

<h1>rocketry</h1>

<a href="https://www.joypixels.com/emoji/1f680">
  <img alt="rocketry" src="logo.png" width="128" />
</a>

<p><em>Simple deployment automation & continuous delivery for Node.js projects.</em></p>

<a href="https://www.npmjs.com/package/rocketry"><img alt="NPM Status" src="https://img.shields.io/npm/v/rocketry"></a>
<a href="https://www.npmtrends.com/rocketry"><img alt="NPM Download Stats" src="https://img.shields.io/npm/dw/rocketry" /></a>
<a href="https://github.com/EvHaus/rocketry/blob/master/LICENSE"><img alt="License" src="https://img.shields.io/github/license/evhaus/rocketry" /></a>
<a href="https://travis-ci.org/EvHaus/rocketry"><img alt="Ci Build" src="https://img.shields.io/travis/com/evhaus/rocketry" /></a>
<a href="https://coveralls.io/github/EvHaus/rocketry?branch=master"><img alt="Coverage Status" src="https://coveralls.io/repos/github/EvHaus/rocketry/badge.svg?branch=master" /></a>

</div><hr />

## The Problem

Services like [DigitalOcean](https://www.digitalocean.com/)'s _droplets_ and [Linode](https://www.linode.com/)'s _linodes_ make it super easy to create deployment targets for websites and other Node.js projects. However, there are still a lot of manual steps developers have to do in order to ship the app: install Node, install a runner like `pm2` or `forever`, install system security patches, zip up & upload the app, create the necessary target directories, and more.

## The Solution

Once you define a single configuration `.rocketryrc` file, you can run `npx deploy run` and everything will be handled for you. Then, with a few other small steps, you can automate the entire process via a CI tool so deployments occur automatically anytime you push changes to your `master` branch.

## Installation & Usage

For instructions on how to use the tool, see [/docs](/docs/README.md).

## Goals & Roadmap

These are the goals for this project:

- [x] Installation & setup of target server
	- [x] Install `node` and upgrade it to the latest version
	- [x] Install `yarn` and upgrade it to the latest version
	- [x] Install `pm2` and upgrade it to the latest version
	- [x] Upgrade `apt-get` packages to ensure the latest system security patches are installed
- [x] Automation of deployment steps
	- [x] Create target directories on target server
	- [x] Upload local project files to target server via SSH
	- [x] Install/upgrade `node` dependencies on target server
	- [x] Start/restart of services on target server
	- [x] Start the application if it's the first deployment, otherwise restart it for updates
	- [x] Integration with CI systems for automated deployment triggers
	- [x] Automated deployments via username & password
	- [ ] Automated deployments via SSH key
	- [ ] Seamless deployments without downtime

## Other Solutions

How does this project differ from similar existing public projects?

- [`Netlify`](https://www.netlify.com/) - It's incredible, but not free past a certain point
- [`Vercel`](https://www.vercel.com/) - Also incredible, but not free past a certain point
- [`dploy`](https://github.com/lucasmotta/dploy) - Doesn't support server-side package upgrades
- [`dployr`](https://github.com/faazshift/dployr) - Assumes the Git project is accessible from the server
- [`shipit`](https://github.com/shipitjs/shipit) - JavaScript-based (as opposed to configuration-based) and doesn't support server-side package upgrades
- [`zaz`](https://github.com/bredikhin/zaz) - Assumes the Git project is accessible from the server

## Contributing

Contributions for bug fixes and new features are welcome via Pull Requests.

### Publishing a New Version

- Set the version you want in `package.json` (or leave it as is)
- Set the same version in `CHANGELOG.md` and put today's date and changes
- Run `npm run release`

### Simulate a Deployment

To simulate a deployment (to test the script), clone this project and run:

```sh
yarn start
```

## LICENSE

MIT

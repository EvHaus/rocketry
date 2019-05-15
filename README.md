# deploy

> A tool for automating deployments of Node.js projects to compute instances

<a href="https://www.npmjs.com/package/@globexdesigns/deploy"><img alt="NPM Status" src="https://img.shields.io/npm/v/@globexdesigns/deploy.svg?style=flat"></a>

## About

Services like [DigitalOcean](https://www.digitalocean.com/)'s droplets make it super easy to create deployment targets for websites and other Node.js projects. However, there are still a lot of manual steps developers have to do in order to get the servers setup, configured and ready to be used for production.

The goal of this tool is to make all those deployment steps a single command. You should focus on developing the features of your project, and let this tool handle the server setup and deployment automation.

## Goals

These are the goals for this project:

- [ ] Installation & setup of target server
	- [x] Install `node`
	- [x] Install `yarn`
	- [ ] Install `pm2`
	- [ ] Install public SSH key
- [x] Automation of deployment
	- [x] Create target directories on target server
	- [x] Upload local project files to target server
	- [x] Install/upgrade `node` dependencies on target server
	- [x] Start/restart of services on target server
	- [ ] Start the application if it's the first deployment, otherwise restart it for updates
	- [ ] Seamless deployments without downtime

## Running the Example

```sh
yarn start
```

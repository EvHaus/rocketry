# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [0.8.9] - Unreleased

### Fixed

- Upgrades for various third-party dependencies

----

## [0.8.8] - 2020-07-25

### Fixed

- Upgrades for various third-party dependencies

----

## [0.8.7] - 2020-06-15

### Fixed

- Fixed broken script as a result of shebang removal

----

## [0.8.6] - 2020-06-15

### Fixed

- Upgrades for various third-party dependencies

----

## [0.8.3] - 2020-05-10

### Added

- Added a progress indicator for when the ZIP file is being uploaded

### Fixed

- Fixed a bug which would cause the uploaded ZIP file to hang forever on some servers

----

## [0.8.2] - 2020-05-10

### Added

- Minor improvements to error handling and messaging

----

## [0.8.1] - 2020-05-07

### Fixed

- Upgrades for various third-party dependencies

----

## [0.8.0] - 2020-03-17

### Changed

- Upgrades for various third-party dependencies

----

## [0.7.2] - 2019-11-02

### Fixed

- Fixed broken builds

----

## [0.7.1] - 2019-11-02

### Added

- `pm2` now shows full timestamps in logs

----

## [0.7.0] - 2019-10-30

### Fixed

- Fixed an issue preventing config defaults for `user` or `private_key_path` from being set correctly

----

## [0.6.2] - 2019-07-08

### Fixed

- Fixed an issue preventing the full stdout value from being seen when the `--debug` option is enabled

----

## [0.6.1] - 2019-07-08

### Added

- `nvm` cache is now cleaned up on every run

### Fixed

- If `nvm` installation failures are detected, the deployment will now abort early.
- Fixed an issue which would cause "npm: command not found" errors to appear in some cases after nvm installations

----

## [0.6.0] - 2019-06-26

### Added

- Added `/docs` documentation
- Added a new `rocketry version` command to print the current version

### Changed

- Renamed the project to `rocketry`
- Renamed the `DEPLOY_PW` environment variable to `ROCKETRY_PW`
- The `-v --verbose` option has been renamed to `-d --debug`

### Fixed

- `apt-get upgrade` commands will no longer stall on upgrades where services starts are required
- Added `wget` and `curl` to the list of installed dependencies as some server instances don't come with it preinstalled

----

## [0.5.2] - 2019-06-10

### Fixed

- Don't validate `private_key_path` if we're using a password

----

## [0.5.1] - 2019-06-10

### Changed

- "DEPLOY_PW" must now have base64 encoded before use
- The `private_key_path` configuration field is now optional

----

## [0.5.0] - 2019-06-10

### Added

- Added support for a "DEPLOY_PW" env variable that can be used a CI secret for automated deployments

----

## [0.4.0] - 2019-05-26

### Added

- Will now install and update `pm2` on the target server
- Now supports a new `name` configuration option that will set the name of the `pm2` application (by default will use the name in the `package.json` of the app)

### Fixed

- Another attempt to fix an issue causing an exception when upgrading node via `nvm`

----

## [0.3.14] - 2019-05-24

### Fixed

- Bad deployment

----

## [0.3.13] - 2019-05-24

### Fixed

- Another attempt to figure out why `nvm` errors are causing crashes

----

## [0.3.12] - 2019-05-24

### Fixed

- Another attempt to fix an issue causing an exception when upgrading node via `nvm`

----

## [0.3.11] - 2019-05-22

### Fixed

- Fixed an issue causing an exception when upgrading node via `nvm`

----

## [0.3.10] - 2019-05-18

### Fixed

- A successful `nvm` upgrade will no longer return an error

----

## [0.3.9] - 2019-05-14

### Fixed

- If a wrong password is entered for the SSH server connection, you will now be prompted to retry
- Fixed several critical issues related to SSH command submissions

----

## [0.3.8] - 2019-05-13

### Fixed

- Fixed some issues preventing certain commands from working as designed

----

## [0.3.7] - 2019-05-13

### Fixed

- Fixed bug with zip clean up step

----

## [0.3.6] - 2019-05-13

### Fixed

- Deletes the local deployment zip file after its been uploaded

----

## [0.3.5] - 2019-05-12

### Fixed

- Attempt to fix broken first time `nvm` installation

----

## [0.3.4] - 2019-05-12

### Fixed

- Ensure all `apt-get upgrade` commands are also set with `-y` for auto approval

----

## [0.3.3] - 2019-05-12

### Fixed

- Ensure all `apt-get install` commands are set with `-y` for auto approval

----

## [0.3.2] - 2019-05-12

### Fixed

- Another attempt at fixing broken builds

----

## [0.3.1] - 2019-05-12

### Fixed

- Fixing published packages

----

## [0.3.0] - 2019-05-12

### Added

- Added documentation to README and added a CHANGELOG
- Migrated to Flow
- Added support for installing `node` and `yarn` on the server before deployment
- Added `--dir` and `--verbose` options
- Configuration is now defined via  `.deployrc` file
- Now supports specifying deployable items via glob paths

----

## [0.2.5] - 2018-06-24

### Added

- Initial release

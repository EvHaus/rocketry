# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [0.3.8] - Unreleased

### Fixed

-

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

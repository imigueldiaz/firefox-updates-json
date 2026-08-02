# Changelog

All notable changes to this project are documented in this file.

## [1.3.0] - 2026-08-02

### Fixed
- `create_version` and `update_version` inputs are now parsed as real booleans. Previously `core.getInput('create_version') || true` treated the string `"false"` as truthy, so `create_version: false` never disabled version creation and the `update_version` branch was unreachable.
- `update_info_url` input is now actually read and written into the generated `updates.json` entry. It was previously declared in `action.yml`/README but never consumed by `index.js`.

### Security
- Resolved 4 open Dependabot alerts (`js-yaml`, `brace-expansion`, `@babel/core`) via `npm audit fix`.

## [1.1.0] - 2026-05-13

### Fixed
- Prevent the action from running automatically when `index.js` is imported in tests.
- Adjusted the Jest test suite so mocks for `@actions/core` and `@actions/github` are applied before loading `index.js`.
- Fixed `__tests__/main.test.js` assertions to verify the actual generated output files.

### Security
- Applied an npm dependency override to force `undici` to `^6.23.0`, mitigating GitHub Dependabot `undici` vulnerabilities.

### Maintenance
- Updated README to better explain local execution and testing instructions.

## [1.0.0]

### Added
- Initial proof-of-concept Firefox extension updates GitHub Action implementation.
- Basic handling of `manifest.json`, `updates.json`, and SHA512 hash generation.
- Initial test scaffolding and README documentation.

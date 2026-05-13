# Changelog

All notable changes to this project are documented in this file.

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

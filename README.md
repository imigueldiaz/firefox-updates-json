# Firefox Extension Updates Action

This GitHub Action automates the process of creating and handling self-hosted signed Firefox extension updates. It simplifies the management of your extension's update process by automatically updating the `updates.json` file and optionally modifying the `manifest.json` file.

## Project status

**This is a personal experiment I built to learn about GitHub Actions and the Firefox extension update mechanism.** It is still untested and unfinished — a proof of concept of a few hours of work, not a maintained product.

- I do **not** plan to add features, review pull requests for new functionality, or provide support.
- The only maintenance this repository will receive going forward is **fixing security vulnerabilities** flagged by Dependabot/`npm audit`.
- It is **not audited for production use**. If you rely on it, review the code yourself and test the full update flow (including signing, see below) before shipping it to real users. See [Known bugs](#known-bugs) for known-broken inputs.

> Note: recent maintenance has been limited to dependency security updates (e.g. `undici`, `js-yaml`, `brace-expansion`, `@babel/core`) and test isolation fixes — no functional changes.

## Firefox requirements this action does *not* handle

This action only writes `updates.json` and (optionally) the `update_url` field in `manifest.json`. It does **not** build a valid, installable extension update on its own — you are still responsible for the following, which Firefox enforces regardless of what this action produces:

- **Signing.** Firefox (release channel) refuses to install or auto-update any extension, including self-distributed ones, unless the `.xpi` has been signed by Mozilla. This action does not sign anything; you must submit the build to [AMO for signing](https://extensionworkshop.com/documentation/publish/submitting-an-add-on/) (unlisted/self-distribution) as a separate step before publishing the file this action links to.
- **`update_hash` algorithm.** Must be `sha256:` or `sha512:`. This action emits `sha512:<hex>`, which is valid.
- **HTTPS hosting for the update manifest.** Firefox requires the update manifest (`updates.json`) to be served over HTTPS. `raw.githubusercontent.com` satisfies this.
- **Correct `Content-Type` for the `.xpi` file.** For a user to install the extension by clicking a link on a webpage, the server must serve the `.xpi` with `Content-Type: application/x-xpinstall`. `raw.githubusercontent.com` serves all files as `text/plain; charset=utf-8` with `X-Content-Type-Options: nosniff`, so a direct link to the raw `.xpi` will **not** trigger Firefox's install prompt — users would need to download the file first and install it manually (e.g. via `about:addons` → *Install Add-on From File*). If you need one-click install links, host the `.xpi` somewhere that sets the correct MIME type. This limitation is less relevant for the *background* update check itself (Firefox's updater downloads `update_link` directly and verifies it against `update_hash`), but it has not been independently verified against `raw.githubusercontent.com` and should not be assumed to work reliably in production.
- **A valid extension ID.** The mock `manifest.json` in this repo uses `"MockExtensionID"` as a placeholder, which is **not** a valid `browser_specific_settings.gecko.id`. A real ID must either look like an email address (e.g. `your-extension@example.com`) or be a UUID wrapped in braces (e.g. `{daf44bf7-a45e-4450-979c-91cf07434c3d}`).

## Prerequisites

To build the extension locally you need to have the package `@vercel/ncc` by [@vercel](https://github.com/vercel) installed globally.

```bash
npm i -g @vercel/ncc
```

## Building the extension

Install dependencies, run tests, and build the extension with:

```bash
npm install
npm test
npm run build
```

The extension will be built in the `dist` folder.

## Run the action locally to mock the extension update URL

After building the action, run:

```bash
node dist/index.js
```

The action will update or create the `updates.json` file with the new version of the extension and the `manifest.json` file with the new update URL.



## Mock files

The `manifest.json` and `extension.xpi` files are mock files that are used to simulate the extension and its manifest. You can replace them with the actual files of your extension.


## Inputs

- `branch` (required): The branch to be used for the update URL. Default is `'main'`.
- `file_name` (required): The file name of the extension with the relative path from the branch. Default is `'extension.xpi'`.
- `manifest` (required): The path to the `manifest.json` file. Default is `'./manifest.json'`.
- `updates_file` (required): The path to the `updates.json` file. Default is `'./updates.json'`.
- `create_version` (optional): Create a version entry if it does not exist. Default is `true`. ⚠️ See [Known bugs](#known-bugs).
- `update_version` (optional): Update the version entry if it already exists. Default is `false`. ⚠️ See [Known bugs](#known-bugs) — this branch is currently unreachable.
- `update_info_url` (optional): The full URL to the update info. Default is an empty string. ⚠️ **Not implemented** — see [Known bugs](#known-bugs).
- `update_manifest` (optional): Update the `update_url` in the manifest. Default is `true`.

## Outputs

- `version`: The version specified in the manifest.

## Usage

To use this action in your workflow, add the following step:

```yaml
- name: Firefox Extension Updates
  uses: imigueldiaz/firefox-updates-json@v1.3
  with:
    branch: 'main'
    file_name: 'extension.xpi'
    manifest: './manifest.json'
    updates_file: './updates.json'
    create_version: true
    update_version: false
    update_manifest: true
```
Make sure to replace your-username and your-repo with the appropriate values.
Functionality
The action performs the following steps:

    Reads the manifest.json file and extracts the extension ID and version.
    Calculates the SHA512 hash of the extension file.
    Updates or creates a version entry in the updates.json file based on the provided inputs.
    Optionally updates the update_url in the manifest.json file.

By using this action, you can automate the process of managing your Firefox extension updates directly from your GitHub repository.

## Known bugs

These were found while auditing the code against its own documentation. They have **not** been fixed yet — treat the affected inputs as unreliable:

- **`create_version` / `update_version` cannot actually be toggled off.** `index.js` reads these with `core.getInput('create_version') || true`. `core.getInput()` always returns a string, and a non-empty string like `"false"` is truthy in JavaScript, so passing `create_version: false` does **not** disable version creation — the string `"false"` still evaluates as truthy. As a direct consequence, since the code is `if (createVersion) { ... } else if (updateVersion) { ... }` and `createVersion` is effectively always truthy, **the `update_version` branch never runs**, regardless of what you set it to.
- **`update_info_url` has no effect.** It's declared as an input in `action.yml` and documented above, but `index.js` never reads it or writes an `update_info_url` field into the generated `updates.json` entry. Setting it currently does nothing.

## License

The scripts and documentation in this project are released under the MIT License

## Contributions

This project is not actively developed (see [Project status](#project-status)), so please don't expect feature PRs to be reviewed or merged. Bug reports and security-related PRs are still welcome and will be looked at.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for the project history and recent maintenance updates.

## Acknowledgements

[@vercel](https://github.com/vercel) for the `@vercel/ncc` package.

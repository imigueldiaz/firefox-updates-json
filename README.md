# Firefox Extension Updates Action

This GitHub Action automates the process of creating and handling self-hosted signed Firefox extension updates. It simplifies the management of your extension's update process by automatically updating the `updates.json` file and optionally modifying the `manifest.json` file.

## Warning

**This action is still really untested and unfinished and should not be used in production. By now it is a proof of concept of only a few hours of work**

## Inputs

- `branch` (required): The branch to be used for the update URL. Default is `'main'`.
- `file_name` (required): The file name of the extension with the relative path from the branch. Default is `'extension.xpi'`.
- `manifest` (required): The path to the `manifest.json` file. Default is `'./manifest.json'`.
- `updates_file` (required): The path to the `updates.json` file. Default is `'./updates.json'`.
- `create_version` (optional): Create a version entry if it does not exist. Default is `true`.
- `update_version` (optional): Update the version entry if it already exists. Default is `false`.
- `update_info_url` (optional): The full URL to the update info. Default is an empty string.
- `update_manifest` (optional): Update the `update_url` in the manifest. Default is `true`.

## Outputs

- `version`: The version specified in the manifest.

## Usage

To use this action in your workflow, add the following step:

```yaml
- name: Firefox Extension Updates
  uses: imigueldiaz/firefox-updates-json@V1.1
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

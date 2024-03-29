const core = require('@actions/core');
const github = require('@actions/github');

try {
    const manifest = require(core.getInput('manifest'));

    if (manifest && manifest.version) {
        console.log('Version:', manifest.version);
        core.setOutput("version", manifest.version);
    } else {
        console.log('No version found in manifest');
    }
} catch (error) {
    core.setFailed(error.message);
}

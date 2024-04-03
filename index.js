require('dotenv').config();

const core = require("@actions/core");
const github = require("@actions/github");
const fs = require("fs");
const crypto = require("crypto");
const path = require("path");

const owner = github.context.repo.owner;
const repo = github.context.repo.repo;


async function calculateSHA512(filename) {
  return new Promise((resolve, reject) => {
    if (!filename || !fs.existsSync(filename)) {
      reject(new Error(`File not found at path: ${__dirname}/${filename}`));
      return;
    }
    const hash = crypto.createHash('sha512');
    const stream = fs.createReadStream(filename);
    stream.on('error', err => reject(err));
    stream.on('data', chunk => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}


async function main() {
	try {
		const fileName = core.getInput('file_name') || "extension.xpi";
		const manifestPath = core.getInput('manifest') || "manifest.json";

		let manifestFile;
		try {
			manifestFile = fs.readFileSync(manifestPath, 'utf8');
		} catch (error) {
			if (error.code === 'ENOENT') {
				core.setFailed('No manifest file found');
				throw new Error('No manifest file found');
			} else {
				throw error;
			}
		}

		const manifest = JSON.parse(manifestFile);

		if (!manifest) {
			core.setFailed('Manifest file could not be parsed');
			throw new Error('manifest file could not be parsed');
		}

		const extensionId = manifest.browser_specific_settings.gecko.id;

		if (!extensionId) {
			core.setFailed('No extension ID found in manifest');
			throw new Error('No extension ID found in manifest');
		}

		console.log('Extension ID:', extensionId);

		if (manifest.version) {
			console.log('Version:', manifest.version);
			core.setOutput("version", manifest.version);

			const updatesPath = core.getInput('updates_file') || "updates.json";

			let updatesFile;
			try {
				updatesFile = fs.readFileSync(updatesPath, 'utf8');
			} catch (error) {
				if (error.code === 'ENOENT') {
					fs.writeFileSync(updatesPath, '{"addons":{}}', { encoding: 'utf8' });
					updatesFile = '{"addons":{}}';
				} else {
					throw error;
				}
			}

			let updates;
			try {
				updates = JSON.parse(updatesFile);
			} catch (error) {
				console.warn('Updates file could not be parsed, initializing with default structure');
				updates = { addons: {} };
			}

			if (!updates.addons) {
				updates.addons = {};
			}

			if (!updates.addons[extensionId]) {
				updates.addons[extensionId] = {
					updates: []
				};
			}


			const createVersion = core.getInput('create_version') || true;
			const updateVersion = core.getInput('update_version') || false;
			const branch = core.getInput('branch') || "main";

			let sha512;
			try {
				sha512 = await calculateSHA512(fileName);
				console.log(`sha512:${sha512}`);
			} catch (err) {
				console.error('Error calculating hash:', err);
				sha512 = undefined;
			}

			const updateEntry = {
				version: manifest.version,
				update_link: `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${fileName}`
			};

			if (sha512) {
				updateEntry.update_hash = `sha512:${sha512}`;
			}

			if (createVersion) {
				if (!updates.addons[extensionId].updates) {
					updates.addons[extensionId].updates = [];
				}
				const existingUpdateIndex = updates.addons[extensionId].updates.findIndex(
					update => update.version === manifest.version
					);

				if (existingUpdateIndex === -1) {
					updates.addons[extensionId].updates.push(updateEntry);
				} else {
					console.log(`Version ${manifest.version} already exists in updates. Skipping duplicate entry.`);
				}
			}

			else if (updateVersion) {
				if (!updates.addons[extensionId].updates) {
					updates.addons[extensionId].updates = [];
				}
				const existingUpdateIndex = updates.addons[extensionId].updates.findIndex(
					update => update.version === manifest.version
					);

				if (existingUpdateIndex !== -1) {
					updates.addons[extensionId].updates[existingUpdateIndex] = updateEntry;
				} else {
					updates.addons[extensionId].updates.push(updateEntry);
				}
			}

      		// Write updates.json
			fs.writeFileSync(updatesPath, JSON.stringify(updates, null, 2), { encoding: 'utf8' });

			const updateManifest = core.getInput('update_manifest') || true;

			// Update manifest.json
			if (updateManifest) {
				manifest.browser_specific_settings.gecko.update_url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${updatesPath}`;

				fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), { encoding: 'utf8' });
			}

		} else {
			console.log('No version found in manifest');
			core.setFailed('No version found in manifest');
			throw new Error('No version found in manifest');
		}
	} catch (error) {
		core.setFailed(error.message);
	}

	console.log('Done');


}

main();

module.exports = {
	calculateSHA512,
	main
};


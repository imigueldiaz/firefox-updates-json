const { main } = require('../index');
const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const path = require('path');

jest.mock('@actions/core', () => ({
  getInput: jest.fn(),
  setOutput: jest.fn(),
  setFailed: jest.fn(),
  // Add other functions you are using from @actions/core
}));

jest.mock('@actions/github', () => ({
  context: {
    repo: {
      owner: 'test-owner',
      repo: 'test-repo',
    },
  },
}));

//jest.mock('fs');

jest.spyOn(fs, 'writeFileSync');
jest.spyOn(fs, 'readFileSync');
jest.spyOn(console, 'log');

// ...

describe('main', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    //console.log = jest.fn(); // Mock console.log
  });

  it('should update the manifest and updates files', async () => {
    // Set up mocked inputs and files
    core.getInput
    .mockReturnValueOnce('extension.xpi')
    .mockReturnValueOnce('manifest.json')
    .mockReturnValueOnce('updates.json')
    .mockReturnValueOnce('true')
    .mockReturnValueOnce('false')
    .mockReturnValueOnce('main')
    .mockReturnValueOnce('true');

    fs.readFileSync
    .mockReturnValueOnce('{"browser_specific_settings":{"gecko":{"id":"MockExtensionID"}},"version":"0.1"}')
    .mockReturnValueOnce('{"addons":{}}');

    // Create the extension.xpi file in the same directory as the test file
    const parentDir = path.dirname(__dirname);
    const testFilePath = path.join(parentDir, 'extension.xpi');
    console.log('testFilePath:', testFilePath);
    const testContent = 'This is a test file for extension.xpi';
    fs.writeFileSync(testFilePath, testContent);

    try {
      await fs.promises.access(testFilePath, fs.constants.F_OK);
      console.log('File exists');
    } catch (err) {
      console.log('File does not exist');
    }

    fs.writeFileSync.mockImplementation(() => {});

    // Run the main function
    await main();

    // Assert that the manifest and updates files were updated
    expect(fs.writeFileSync).toHaveBeenCalledTimes(5);
    
    expect(JSON.parse(fs.writeFileSync.mock.calls[1][1])).toEqual(expect.objectContaining({
      addons: {
        "MockExtensionID": {
          updates: [
          {
            version: "0.1",
            update_link: "https://raw.githubusercontent.com/imigueldiaz/firefox-updates-json/main/extension.xpi",
            update_hash: expect.stringContaining("sha512:")
          }
          ]
        }
      }
    }));

    // Assert that the expected messages were logged
    expect(console.log).toHaveBeenCalledWith('Extension ID:', 'MockExtensionID');
    expect(console.log).toHaveBeenCalledWith('Version:', '0.1');
    expect(console.log).toHaveBeenCalledWith('Done');
  });
});


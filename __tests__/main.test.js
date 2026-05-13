process.env.GITHUB_REPOSITORY = 'test-owner/test-repo';

jest.mock('@actions/core', () => ({
  getInput: jest.fn(),
  setOutput: jest.fn(),
  setFailed: jest.fn(),
}));

jest.mock('@actions/github', () => ({
  context: {
    repo: {
      owner: 'test-owner',
      repo: 'test-repo',
    },
  },
}));

const { main } = require('../index');
const core = require('@actions/core');
const fs = require('fs');
const path = require('path');

describe('main', () => {
  let writeFileSyncSpy;
  let readFileSyncSpy;
  let consoleLogSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    if (writeFileSyncSpy) writeFileSyncSpy.mockRestore();
    if (readFileSyncSpy) readFileSyncSpy.mockRestore();
    if (consoleLogSpy) consoleLogSpy.mockRestore();
  });

  it('should update the manifest and updates files', async () => {
    const parentDir = path.dirname(__dirname);
    const testFilePath = path.join(parentDir, 'extension.xpi');
    const testContent = 'This is a test file for extension.xpi';
    fs.writeFileSync(testFilePath, testContent);

    readFileSyncSpy = jest.spyOn(fs, 'readFileSync')
      .mockReturnValueOnce('{"browser_specific_settings":{"gecko":{"id":"MockExtensionID"}},"version":"0.1"}')
      .mockReturnValueOnce('{"addons":{}}');

    writeFileSyncSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});

    core.getInput
      .mockReturnValueOnce('extension.xpi')
      .mockReturnValueOnce('manifest.json')
      .mockReturnValueOnce('updates.json')
      .mockReturnValueOnce('true')
      .mockReturnValueOnce('false')
      .mockReturnValueOnce('main')
      .mockReturnValueOnce('true');

    await main();

    expect(writeFileSyncSpy.mock.calls.length).toBeGreaterThanOrEqual(2);
    expect(writeFileSyncSpy.mock.calls.some(call => call[0] === 'updates.json')).toBe(true);
    expect(writeFileSyncSpy.mock.calls.some(call => call[0] === 'manifest.json')).toBe(true);

    const updatesCall = writeFileSyncSpy.mock.calls.find(call => call[0] === 'updates.json');
    expect(updatesCall).toBeDefined();
    expect(JSON.parse(updatesCall[1])).toEqual(expect.objectContaining({
      addons: {
        MockExtensionID: {
          updates: [
            {
              version: '0.1',
              update_link: 'https://raw.githubusercontent.com/test-owner/test-repo/main/extension.xpi',
              update_hash: expect.stringContaining('sha512:'),
            },
          ],
        },
      },
    }));

    expect(consoleLogSpy).toHaveBeenCalledWith('Extension ID:', 'MockExtensionID');
    expect(consoleLogSpy).toHaveBeenCalledWith('Version:', '0.1');
    expect(consoleLogSpy).toHaveBeenCalledWith('Done');
  });
});

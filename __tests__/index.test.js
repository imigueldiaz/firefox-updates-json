const { calculateSHA512 } = require('../index');
const fs = require('fs');
const crypto = require('crypto');

describe('calculateSHA512', () => {

  it('should calculate the SHA512 hash of a file', async () => {
    const testFile = '__tests__/testFile.txt';
    const testContent = 'This is a test file.';

    fs.writeFileSync(testFile, testContent);

    const expectedHash = crypto.createHash('sha512').update(testContent).digest('hex');
    const actualHash = await calculateSHA512(testFile);

    expect(actualHash).toBe(expectedHash);

    fs.unlinkSync(testFile);
  });
});

const fs = require('fs');

module.exports = {
  Storage: jest.fn(() => ({
    bucket: jest.fn(() => ({
      name: 'test',
      file: jest.fn(() => ({
        createWriteStream: () => fs.createWriteStream('tests/testFile'),
      })),
    })),
  })),
};

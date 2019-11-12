/* eslint-disable no-underscore-dangle, no-param-reassign, class-methods-use-this */
const sharp = require('sharp');
const gcsBucket = require('./index.js');

class MulterGCStorage {
  constructor(options) {
    this.options = options;
  }

  _handleFile(req, file, cb) {
    const { prefix, size } = this.options;

    const gcsFileName = `${prefix}/${size.width}x${size.height}/${Date.now()}-${
      file.originalname
    }`;
    file.filename = gcsFileName;

    const gcsFileURL = `https://storage.googleapis.com/${gcsBucket.name}/${gcsFileName}`;

    const resizer = sharp().resize({
      width: size.width,
      height: size.height,
    });

    const gcsFile = gcsBucket.file(gcsFileName);

    const gcsWritableStream = gcsFile.createWriteStream({
      predefinedAcl: 'publicread',
    });

    file.stream
      .pipe(resizer)
      .on('error', (err) => {
        resizer.unpipe(gcsWritableStream);
        cb(err);
      })
      .pipe(gcsWritableStream)
      .on('error', cb)
      .on('finish', () => {
        cb(null, {
          url: gcsFileURL,
        });
      });
  }

  async _removeFile(req, file, cb) {
    try {
      const gcsFile = gcsBucket.file(file.filename);
      delete file.filename;
      delete file.url;
      await gcsFile.delete();
    } catch (err) {
      cb(err);
    }
  }
}

module.exports = (options) => new MulterGCStorage(options);

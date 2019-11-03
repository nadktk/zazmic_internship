const gcsBucket = require('../gcs');
const { errorLogger } = require('../logger/logger.js');

exports.deleteFile = async (url) => {
  const filename = url.split(`${gcsBucket.name}/`)[1];
  if (filename) {
    try {
      const gFile = gcsBucket.file(filename);
      await gFile.delete();
    } catch (err) {
      errorLogger.log({
        level: 'error',
        message: err.message,
        metadata: err.stack,
        label: 'gcs',
      });
    }
  }
};

const { Storage } = require('@google-cloud/storage');

const gcStorage = new Storage({
  projectId: process.env.GC_PROJECT,
  keyFilename: 'gcs/zazmic-blog-storage.json',
});

const gcsBucket = gcStorage.bucket(process.env.GCS_BUCKET);

module.exports = gcsBucket;

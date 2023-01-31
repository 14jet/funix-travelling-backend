const { initializeApp, cert } = require("firebase-admin/app");
const { getStorage } = require("firebase-admin/storage");

const serviceAccount = require("./travelling-website-funix-v1-firebase-adminsdk-q8456-e254d13ac4.json");
const BUCKET_NAME = "travelling-website-funix-v1.appspot.com";
const URL_PREFIX = `https://storage.googleapis.com/${BUCKET_NAME}`;

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: BUCKET_NAME,
});

const bucket = getStorage().bucket();

async function uploadFromMemoryToGC(destFileName, contents) {
  // handle img base64
  if (typeof contents === "string") {
    const base64 = contents.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64, "base64");

    await bucket.file(destFileName).save(buffer, { public: true });
    const url = `${URL_PREFIX}/${destFileName}`;
    return url;
  }

  await bucket.file(destFileName).save(contents, { public: true });
  const url = `${URL_PREFIX}/${destFileName}`;
  return url;
}

async function deleteFileFromGC(fileName) {
  await bucket.file(fileName.split(`${URL_PREFIX}/`)[1]).delete();
}

module.exports = {
  uploadFromMemoryToGC,
  deleteFileFromGC,
};

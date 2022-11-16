const getExt = require("./getFileExtension");
const fbStorage = require("./firebase");
const { v4: uuid } = require("uuid");
const {
  ref,
  uploadBytes,
  uploadString,
  getDownloadURL,
} = require("firebase/storage");

async function uploadFilesToFirebase(files, base64 = false) {
  let refs = [];

  if (!base64) {
    refs = files.map((file) => ({
      file: file.buffer,
      ref: ref(
        fbStorage,
        "images/" + uuid() + "." + getExt.filename(file.originalname)
      ),
      metadata: {
        contentType: `image/${getExt.filename(file.originalname)}`,
      },
    }));
  } else {
    refs = files.map((item) => ({
      file: item,
      ref: ref(fbStorage, "images/" + uuid() + "." + getExt.base64(item)[1]),
      metadata: {
        contentType: `image/${getExt.base64(item)[1]}`,
      },
    }));
  }

  await Promise.all(
    refs.map((ref) => {
      return base64
        ? uploadString(ref.ref, ref.file, "data_url", ref.metadata)
        : uploadBytes(ref.ref, ref.file, ref.metadata);
    })
  );

  const imageURLs = await Promise.all(
    refs.map((ref) => getDownloadURL(ref.ref))
  );

  return imageURLs;
}

module.exports = uploadFilesToFirebase;

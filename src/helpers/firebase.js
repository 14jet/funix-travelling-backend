const { initializeApp } = require("firebase/app");
const {
  getStorage,
  ref,
  deleteObject,
  uploadBytes,
  uploadString,
  getDownloadURL,
} = require("firebase/storage");
const { v4: uuid } = require("uuid");
const getExt = require("./getFileExtension");
const config = require("config");

// init storage
const app = initializeApp(config.get("firebaseConfig"));
const storage = getStorage(app);

// delete files handler
// images: array of urls
function deleteFiles(images) {
  if (!Array.isArray(images)) {
    console.error("From deleteFiles - ntav: images must be an array");
    return;
  }

  for (const image of images) {
    try {
      const imageRef = ref(storage, image);
      deleteObject(imageRef)
        .then(() => {
          return true;
        })
        .catch((error) => {
          console.error(error);
        });
    } catch (error) {
      console.error(error);
    }
  }
}

// upload files handler
async function uploadFiles(files, base64 = false, path = "") {
  console.log(files);
  let refs = [];
  const createPath = () => `images/${path}` + uuid() + ".";

  if (base64) {
    refs = files.map((item) => ({
      file: item,
      ref: ref(storage, createPath() + "." + getExt.base64(item)[1]),
      metadata: {
        contentType: `image/${getExt.base64(item)[1]}`,
      },
    }));

    await Promise.all(
      refs.map((ref) =>
        uploadString(ref.ref, ref.file, "data_url", ref.metadata)
      )
    );
  }

  if (!base64) {
    refs = files.map((file) => ({
      file: file.buffer,
      ref: ref(
        storage,
        createPath() + "." + getExt.filename(file.originalname)
      ),
      metadata: {
        contentType: `image/${getExt.filename(file.originalname)}`,
      },
    }));

    await Promise.all(
      refs.map((ref) => uploadBytes(ref.ref, ref.file, ref.metadata))
    );
  }

  const imageURLs = await Promise.all(
    refs.map((ref) => getDownloadURL(ref.ref))
  );

  return imageURLs;
}

module.exports = { storage, uploadFiles, deleteFiles };

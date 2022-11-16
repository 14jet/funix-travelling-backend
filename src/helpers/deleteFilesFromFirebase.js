const fbStorage = require("./firebase");
const {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} = require("firebase/storage");

// images: array of urls
function deleteFilesFromFirebase(images) {
  for (const image of images) {
    try {
      const imageRef = ref(fbStorage, image);
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

module.exports = deleteFilesFromFirebase;

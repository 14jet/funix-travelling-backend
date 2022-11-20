const sharp = require("sharp");

const imgResizer = (buffer) => {
  return new Promise(async (res, _) => {
    try {
      const resizedImg = await sharp(buffer)
        .resize(380, 250, { fit: "cover" })
        .jpeg({ mozjpeg: true })
        .toBuffer();

      return res([null, resizedImg]);
    } catch (error) {
      return res([error, null]);
    }
  });
};

module.exports = {
  imgResizer,
};

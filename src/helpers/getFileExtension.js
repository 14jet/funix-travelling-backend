const mimeList = [
  { ext: "png", mime: "image/png" },
  { ext: "jpg", mime: "image/jpg" },
  { ext: "jpeg", mime: "image/jpeg" },
];

const baseOnFilename = (filename) =>
  filename.slice(filename.lastIndexOf(".") + 1);

const base64 = (text) => {
  const mimeItem = mimeList.find((item) =>
    text.slice(0, 30).includes(item.mime)
  );
  if (!mimeItem) {
    return [new Error("Not valid mime type"), null];
  }

  return [null, mimeItem.ext];
};

module.exports = {
  filename: baseOnFilename,
  base64,
};

const { v4: uuid } = require("uuid");

const getFileExtension = (filename) => {
  let text = filename;
  while (text.indexOf(".") !== -1) {
    text = text.slice(text.indexOf(".") + 1);
  }
  return text;
};

module.exports = getFileExtension;

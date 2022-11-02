const path = require("path");
const fs = require("fs");
const { v4: uuid } = require("uuid");
const { format } = require("date-fns");
const rootDir = require("./rootDir");

const filePath = path.join(rootDir, "logs", "error.log");

const logger = async (errorMessage) => {
  try {
    const time = format(new Date(), "dd-MM-yyyy\thh:mm:ss");
    const log = `${uuid()}\t${time}\t${errorMessage}\n`;
    await fs.promises.appendFile(filePath, log);
  } catch (error) {
    console.error(error);
  }
};

module.exports = logger;

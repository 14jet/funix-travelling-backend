const express = require("express");
const path = require("path");
const rootDir = require("../helpers/rootDir");

module.exports = express.static(path.join(rootDir, "uploads", "images"));

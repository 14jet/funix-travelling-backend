const express = require("express");
const router = express.Router();

// controllers
const { getAbout } = require("../../controllers/client/about");

// routes
router.get("/", getAbout);

module.exports = router;

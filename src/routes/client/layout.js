const express = require("express");
const router = express.Router();

// controllers
const { getLayoutData } = require("../../controllers/client/layout");

// routes
router.get("/", getLayoutData);

module.exports = router;

const express = require("express");
const router = express.Router();

// controllers
const { getTerm } = require("../../controllers/client/term");

// routes
router.getTerm("/:type", getTerm);

module.exports = router;

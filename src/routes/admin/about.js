const express = require("express");
const router = express.Router();

// controllers
const { getAbout, update } = require("../../controllers/admin/about");

// routes
router.get("/", getAbout);
router.put("/", update);

module.exports = router;

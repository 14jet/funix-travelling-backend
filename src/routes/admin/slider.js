const express = require("express");
const router = express.Router();

// controllers
const { updateSlider } = require("../../controllers/admin/slider");

// routes
router.put("/", updateSlider);

module.exports = router;

const express = require("express");
const router = express.Router();

// controllers
const { getCompanyInfo } = require("../../controllers/client/company");

// routes
router.get("/", getCompanyInfo);

module.exports = router;

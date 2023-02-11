const express = require("express");
const router = express.Router();

// controllers
const {
  getCompanyInfo,
  updateCompanyInfo,
} = require("../../controllers/admin/company");

// routes
router.get("/", getCompanyInfo);
router.put("/", updateCompanyInfo);

module.exports = router;

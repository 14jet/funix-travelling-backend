const express = require("express");
const router = express.Router();

// controllers
const {
  getTerms,
  updateTerm,
  getTerm,
} = require("../../controllers/admin/term");

// routes
router.get("/", getTerms);
router.put("/", updateTerm);
router.get("/:type", getTerm);

module.exports = router;

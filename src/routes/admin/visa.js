const express = require("express");
const router = express.Router();

// controllers
const {
  addVisa,
  editVisa,
  deleteVisa,
  getVisas,
  getSingleVisa,
} = require("../../controllers/admin/visa");

// routes
router.get("/", getVisas);
router.put("/", editVisa);
router.delete("/", deleteVisa);
router.post("/", addVisa);
router.get("/:visaId", getSingleVisa);

module.exports = router;

const express = require("express");
const router = express.Router();

// validations
const addVisaValidator = require("../../validators/visa/addVisa");
const editVisaValidator = require("../../validators/visa/editVisa");

// controllers
const {
  getVisas,
  addVisa,
  editVisa,
  deleteVisa,
  getSingleVisa,
} = require("../../controllers/client/visa");

// routes
router.get("/", getVisas);
router.post("/", addVisaValidator, addVisa);
router.put("/", editVisaValidator, editVisa);
router.delete("/", deleteVisa);
router.get("/:visaId", getSingleVisa);

module.exports = router;

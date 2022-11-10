const express = require("express");
const router = express.Router();

// validations
const addVisaValidator = require("../validators/visa/addVisa");
const editVisaValidator = require("../validators/visa/editVisa");

// controllers
const visaControllers = require("../controllers/visa");

// middlewares

// routes
router.get("/", visaControllers.getVisas);
router.post("/", addVisaValidator, visaControllers.addVisa);
router.put("/", editVisaValidator, visaControllers.editVisa);
router.delete("/", visaControllers.deleteVisa);
router.get("/:visaId", visaControllers.getSingleVisa);

module.exports = router;

const express = require("express");
const router = express.Router();

// controllers
const {
  getVisasAvailableCountries,
  getSingleVisa,
  getVisasAccordingToCountry,
} = require("../../controllers/client/visa");

// routes
router.get("/", getVisasAvailableCountries);
router.get("/country/:country", getVisasAccordingToCountry);
router.get("/:visaId", getSingleVisa);

module.exports = router;

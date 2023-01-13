const express = require("express");
const router = express.Router();

const { getPlaces } = require("../../controllers/admin/places");

router.get("/", getPlaces);

module.exports = router;

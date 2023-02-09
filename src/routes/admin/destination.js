const express = require("express");
const router = express.Router();

// controllers
const {
  addDestinationItem,
  getDestinations,
  deleteDestinationItem,
  updateDestinationItem,
} = require("../../controllers/admin/destination");

// middlewares

// routes
router.post("/", addDestinationItem);
router.put("/", updateDestinationItem);
router.get("/", getDestinations);
router.delete("/", deleteDestinationItem);

module.exports = router;

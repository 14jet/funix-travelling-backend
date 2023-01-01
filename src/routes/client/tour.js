const express = require("express");
const router = express.Router();

// controllers
const {
  getTours,
  getSingleTour,
  bookTour,
  callMeBack,
} = require("../../controllers/client/tour");

// routes
router.get("/", getTours);
router.get("/:tourId", getSingleTour);
router.post("/booking", bookTour);
router.post("/advisory", callMeBack);

module.exports = router;

const express = require("express");
const router = express.Router();

// controllers
const tourController = require("../controllers/tour");

// middlewares
const requireAdmin = require("../middlewares/requireAdmin");
const multer = require("../middlewares/multer");

// validators
const reviewTourValidator = require("../validators/reviewTour");
const addItineraryValidator = require("../validators/addItinerary.js");
const addTourValidator = require("../validators/addTour");
const editTourValidator = require("../validators/editTour");
const deleteTourValidator = require("../validators/deleteTour");

// routes

router.delete(
  "/",
  requireAdmin,
  deleteTourValidator,
  tourController.deleteTour
);
router.get("/", tourController.getTours);
router.post("/:tourId", tourController.getSingleTour);

module.exports = router;

const express = require("express");
const router = express.Router();

// controllers
const tourController = require("../controllers/tour.controller");

// middlewares
const requireAdmin = require("../middlewares/requireAdmin.middleware");
const multer = require("../middlewares/multer.middleware");

// validators
const bookTourValidator = require("../validators/booktour.validator");
const reviewTourValidator = require("../validators/reviewTour.validator");
const addItineraryValidator = require("../validators/addItinerary.validator.js");

// routes
router.post("/", multer.multiple, tourController.addTour); // tao tour
router.put("/", multer.multiple, tourController.editTour);
router.delete("/", tourController.deleteTour);
router.get("/", tourController.getTours);
router.get("/:tourId", tourController.getSingleTour);
router.get("/review", tourController.getReviews);
router.post("/review", tourController.addReview);
router.post("/itinerary", addItineraryValidator, tourController.addItinerary);

module.exports = router;

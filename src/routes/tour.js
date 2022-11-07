const express = require("express");
const router = express.Router();

// controllers
const tourController = require("../controllers/tour");

// middlewares
const requireAdmin = require("../middlewares/requireAdmin");
const multer = require("../middlewares/multer");

// validators
const bookTourValidator = require("../validators/booktour.validator");
const reviewTourValidator = require("../validators/reviewTour");
const addItineraryValidator = require("../validators/addItinerary.js");

// routes
router.post("/", multer.multiple, tourController.addTour); // tao tour
router.put("/", multer.multiple, tourController.editTour);
router.delete("/", tourController.deleteTour);
router.get("/", tourController.getTours);
router.get("/:tourId", tourController.getSingleTour);
router.get("/review", tourController.getReviews);
router.post("/review", tourController.addReview);
router.put("/itinerary", addItineraryValidator, tourController.updateItinerary);

module.exports = router;

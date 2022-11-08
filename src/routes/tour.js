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
router.post("/", multer.multiple, addTourValidator, tourController.addTour); // tao tour
router.put("/", multer.multiple, editTourValidator, tourController.editTour);
router.delete("/", deleteTourValidator, tourController.deleteTour);
router.get("/", tourController.getTours);
router.get("/:tourId", tourController.getSingleTour);
router.get("/review", tourController.getReviews);
router.post("/review", tourController.addReview);
router.put("/itinerary", addItineraryValidator, tourController.updateItinerary);

module.exports = router;

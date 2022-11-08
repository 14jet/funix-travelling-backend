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
router.post(
  "/",
  requireAdmin,
  multer.multiple,
  addTourValidator,
  tourController.addTour
);
router.put(
  "/",
  requireAdmin,
  multer.multiple,
  editTourValidator,
  tourController.editTour
);
router.delete(
  "/",
  requireAdmin,
  deleteTourValidator,
  tourController.deleteTour
);
router.get("/", tourController.getTours);
router.get("/:tourId", tourController.getSingleTour);
router.get("/review", tourController.getReviews);
router.post("/review", tourController.addReview);
router.put(
  "/itinerary",
  requireAdmin,
  addItineraryValidator,
  tourController.updateItinerary
);

module.exports = router;

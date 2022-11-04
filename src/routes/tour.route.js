const express = require("express");
const router = express.Router();

// controllers
const tourController = require("../controllers/tour.controller");

// middlewares
const multer = require("../middlewares/multer.middleware");
const requireAdmin = require("../middlewares/requireAdmin.middleware");

// validators
const bookTourValidator = require("../validators/booktour.validator");
const reviewTourValidator = require("../validators/reviewTour.validator");

// routes
router.post("/book", bookTourValidator, tourController.bookTour);
router.post("/review", reviewTourValidator, tourController.addReview);

// routes
router.post("/", tourController.addTour);
router.put("/", tourController.editTour);
router.delete("/", tourController.deleteTour);
router.get("/", tourController.getTours);
router.get("/:tourId", tourController.getSingleTour);

module.exports = router;

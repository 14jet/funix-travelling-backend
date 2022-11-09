const express = require("express");
const router = express.Router();

// controllers
const tourController = require("../../controllers/client/tour.controller");

// validators
const bookTourValidator = require("../../validators/booktour.validator");
const reviewTourValidator = require("../../validators/reviewTour.validator");

// routes
router.post("/book", bookTourValidator, tourController.bookTour);
router.post("/review", reviewTourValidator, tourController.addReview);

module.exports = router;

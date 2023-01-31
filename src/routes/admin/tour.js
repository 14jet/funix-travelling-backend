const express = require("express");
const router = express.Router();

// controllers
const {
  updateTour,
  deleteTour,
  getTours,
  updateHotTours,
  importJSON,
  createTour,
  fetchSingleTour,
} = require("../../controllers/admin/tour");

// middlewares
const multer = require("../../middlewares/multer");

// validators
const addTourValidator = require("../../validators/tour/addTour");
const editTourValidator = require("../../validators/tour/editTour");
const addItineraryValidator = require("../../validators/tour/addItinerary");
const importJSONValidator = require("../../validators/tour/importJSON");

// validation result handler
const validationResultHandler = require("../../validators/validationResultHandler");

// --------- routes -----------
router.post("/", multer.newTour, createTour);
router.put("/", multer.newTour, updateTour);
router.get("/", getTours);
router.get("/:tourCode", fetchSingleTour);
router.delete("/", deleteTour);
router.put("/hot", updateHotTours);
router.post("/json", importJSONValidator, importJSON);

module.exports = router;

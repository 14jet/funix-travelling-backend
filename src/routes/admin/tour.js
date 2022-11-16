const express = require("express");
const router = express.Router();

// controllers
const tourControllers = require("../../controllers/admin/tour");

// middlewares
const multer = require("../../middlewares/multer");

// validators

// routes
router.post(
  "/",
  multer.upload.fields([
    { name: "thumb", maxCount: 1 },
    { name: "slider", maxCount: 4 },
  ]),
  tourControllers.addTour
);
router.get("/:tourId", tourControllers.getSingleTour);
router.put(
  "/",
  multer.upload.fields([
    { name: "thumb", maxCount: 1 },
    { name: "slider", maxCount: 4 },
  ]),
  tourControllers.updateTour
);
router.put("/itinerary", tourControllers.updateItinerary);

module.exports = router;

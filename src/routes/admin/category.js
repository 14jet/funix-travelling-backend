const express = require("express");
const router = express.Router();

// controllers
const {
  getCategories,
  addCategoryItem,
  deleteCatItem,
  updateCatItem,
} = require("../../controllers/admin/category");

// middlewares
const multer = require("../../middlewares/multer");

// routes
router.get("/", getCategories);
router.post("/", multer.single, addCategoryItem);
router.delete("/", deleteCatItem);
router.put("/", updateCatItem);

module.exports = router;

const express = require("express");
const router = express.Router();

// controllers
const categoryControllers = require("../../controllers/admin/category");

// middlewares
const multer = require("../../middlewares/multer");

// validators

// routes
router.get("/", categoryControllers.getCategories);
router.post("/", multer.single, categoryControllers.addCategorieItem);

module.exports = router;

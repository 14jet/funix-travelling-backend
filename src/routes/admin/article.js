const express = require("express");
const router = express.Router();

// controllers
const {
  addArticle,
  updateArticle,
  deleteArticle,
  getSingleArticle,
} = require("../../controllers/admin/article");

// middlewares
const multer = require("../../middlewares/multer");

// routes
router.post("/", multer.single, addArticle);
router.put("/", multer.single, updateArticle);
router.delete("/", deleteArticle);
router.get("/:articleId", getSingleArticle);

module.exports = router;

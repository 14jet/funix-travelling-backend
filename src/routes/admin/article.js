const express = require("express");
const router = express.Router();

// controllers
const {
  addArticle,
  updateArticle,
  deleteArticle,
  getSingleArticle,
  getArticles,
} = require("../../controllers/admin/article");

// middlewares
const multer = require("../../middlewares/multer");

// routes
router.post("/", multer.uploadTourImgs, addArticle);
router.get("/", getArticles);
router.put("/", multer.uploadTourImgs, updateArticle);
router.delete("/", deleteArticle);
router.get("/:articleId", getSingleArticle);

module.exports = router;

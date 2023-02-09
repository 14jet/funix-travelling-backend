const express = require("express");
const router = express.Router();

// controllers
const {
  addArticle,
  updateArticle,
  deleteArticle,
  getSingleArticle,
  getArticles,
  getCategory,
  addCategoryItem,
  updateCategoryItem,
  deleteCategoryItem,
} = require("../../controllers/admin/article");

// middlewares
const multer = require("../../middlewares/multer");

// routes
router.post("/", multer.uploadTourImgs, addArticle);
router.get("/", getArticles);
router.put("/", multer.uploadTourImgs, updateArticle);
router.delete("/", deleteArticle);
router.get("/category", getCategory);
router.post("/category", addCategoryItem);
router.put("/category", updateCategoryItem);
router.delete("/category", deleteCategoryItem);
router.get("/:articleId", getSingleArticle); // phải để sau route trên chứ k nó ăn vào articleId = category

module.exports = router;

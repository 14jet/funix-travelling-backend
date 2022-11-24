const express = require("express");
const router = express.Router();

// controllers
const {
  getArticles,
  getNewArticles,
  searchForArticles,
  getSingleArticle,
} = require("../../controllers/client/article");

// routes
router.get("/", getArticles);
router.get("/search", searchForArticles);
router.get("/:articleId", getSingleArticle);

module.exports = router;

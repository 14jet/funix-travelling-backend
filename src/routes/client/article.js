const express = require("express");
const router = express.Router();

// controllers
const {
  getArticles,
  getSingleArticle,
} = require("../../controllers/client/article");

// routes
router.get("/", getArticles);
router.get("/:articleId", getSingleArticle);

module.exports = router;

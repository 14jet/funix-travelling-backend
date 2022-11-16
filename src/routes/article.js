const express = require("express");
const router = express.Router();

// controllers
const articleControllers = require("../controllers/article");

// middlewares
const requireAdmin = require("../middlewares/requireAdmin");

// validators
const addArticleValidator = require("../validators/addArtilce");
const editArticleValidator = require("../validators/editArticle");

// routes
router.get("/", articleControllers.getArticles);
router.get("/new-articles", articleControllers.getNewArticles);
router.get("/:articleId", articleControllers.getSingleArticle);

router.delete(
  "/:articleId",
  // requireAdmin,
  articleControllers.deleteArticle
);

module.exports = router;

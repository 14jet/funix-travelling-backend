const express = require("express");
const router = express.Router();

// controllers
const articleControllers = require("../controllers/article.controller");

// middlewares

// validators

// routes
router.get("/", articleControllers.getArticles);
router.get("/:articleId", articleControllers.getSingleArticle);
router.post("/", articleControllers.addArticle);
router.put("/", articleControllers.editArticle);
router.delete("/", articleControllers.deleteArticle);

module.exports = router;

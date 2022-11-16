const express = require("express");
const router = express.Router();

// controllers
const articleControllers = require("../../controllers/admin/article");

// middlewares
const multer = require("../../middlewares/multer");

// validators

// routes
router.post("/", multer.single, articleControllers.addArticle);
router.put("/", multer.single, articleControllers.updateArticle);
router.get("/:articleId", articleControllers.getSingleArticle);

module.exports = router;

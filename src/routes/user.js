const express = require("express");
const router = express.Router();

// controllers
const userControllers = require("../controllers/user");

// validators

// middlewares

router.post("/login", userControllers.login);
router.post("/register", userControllers.register);

module.exports = router;
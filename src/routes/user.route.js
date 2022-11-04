const express = require("express");
const router = express.Router();

// controllers
const userControllers = require("../controllers/user.controller");

// validators

// middlewares

router.post("/login", userControllers.login);

module.exports = router;

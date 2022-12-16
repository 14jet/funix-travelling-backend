const express = require("express");
const router = express.Router();

// controllers
const {
  login,
  register,
  getAll,
  getSingle,
  changePassword,
  changeRole,
  deleteUser,
} = require("../../controllers/client/user");

router.post("/login", login);
router.post("/change-password", changePassword);
router.put("/change-role", changeRole);
router.post("/register", register);
router.get("/", getAll);
router.delete("/", deleteUser);
router.get("/:username", getSingle);

module.exports = router;

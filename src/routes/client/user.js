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

// validator
const changePasswordValidator = require("../../validators/user/changePassword.validator");
const validationResultHandler = require("../../validators/validationResultHandler");

// middlewares
const requireAdmin = require("../../middlewares/requireAdmin");

router.post("/login", login);
router.post(
  "/change-password",
  requireAdmin,
  changePasswordValidator,
  validationResultHandler,
  changePassword
);
router.put("/change-role", changeRole);
router.post("/register", register);
router.get("/", getAll);
router.delete("/", deleteUser);
router.get("/:username", getSingle);

module.exports = router;

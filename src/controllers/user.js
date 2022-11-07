const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const config = require("config");
var jwt = require("jsonwebtoken");
const User = require("../models/user");
const createError = require("../helpers/errorCreator");

module.exports.login = async (req, res, next) => {
  try {
    // validation
    const result = validationResult(req);
    const hasError = !result.isEmpty();
    if (hasError) {
      return res.status(400).json({ message: result.array()[0].msg });
    }

    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return next(
        createError(new Error(""), 400, {
          en: "User Not Found",
          vi: "User không tồn tại",
        })
      );
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return next(
        createError(new Error(""), 400, {
          en: "Wrong password",
          vi: "Sai mật khẩu",
        })
      );
    }

    var token = jwt.sign({ username: user.username }, config.get("jwtSecret"), {
      expiresIn: "1h",
    });
    return res.status(200).json({
      user: {
        username: user.username,
        fullname: user.fullname,
        role: user.role,
      },
      accessToken: token,
    });
  } catch (error) {
    next(createError(error, 500));
  }
};

module.exports.changePassword = async (req, res, next) => {
  try {
    // validation
    const result = validationResult(req);
    const hasError = !result.isEmpty();
    if (hasError) {
      return res.status(400).json({ message: result.array()[0].msg });
    }

    const { password, newPassword } = req.body;

    const user = req.user;

    bcrypt.compare(password, user.password, (err) => {
      if (err) {
        return next(
          createError(new Error(""), 400, {
            en: "Wrong password",
            vi: "Sai mật khẩu",
          })
        );
      }
    });

    bcrypt.hash(
      newPassword,
      config.get("bcrypt.saltRounds"),
      async function (err, hash) {
        if (err) {
          throw err;
        }

        user.password = hash;
        await user.save();

        return res.status(200).json({
          message: {
            en: "Password changed",
            vi: "Đổi password thành công",
          },
        });
      }
    );
  } catch (error) {
    next(createError(error, 500));
  }
};

module.exports.register = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user) {
      return next(
        createError(new Error(""), 400, {
          en: "User already exists.",
          vi: "User đã tồn tại",
        })
      );
    }

    bcrypt.hash(
      password,
      config.get("bcrypt.saltRounds"),
      async (error, hash) => {
        if (error) {
          throw error;
        }

        await User.create({ username, password: hash });
        return res.status(200).json({
          message: {
            en: "Registered successfully",
            vi: "Đăng ký tài khoản thành công",
          },
        });
      }
    );
  } catch (error) {
    next(createError(error, 500));
  }
};

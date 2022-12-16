const bcrypt = require("bcrypt");
const config = require("config");
var jwt = require("jsonwebtoken");
const User = require("../../models/user");
const createError = require("../../helpers/errorCreator");

module.exports.login = async (req, res, next) => {
  try {
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
      expiresIn: "3h",
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
    const { username, password, new_password } = req.body;

    const user = await User.findOne({ username });

    try {
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return next(
          createError(new Error(""), 400, {
            en: "Wrong password",
            vi: "Sai mật khẩu",
          })
        );
      }
    } catch (error) {
      return next(
        createError(new Error(""), 400, {
          en: "Wrong password",
          vi: "Sai mật khẩu",
        })
      );
    }

    bcrypt.hash(
      new_password,
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
    const { username, password, role } = req.body;

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

        await User.create({ username, password: hash, role });
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

module.exports.getAll = async (req, res, next) => {
  try {
    const users = await User.find({}, { password: 0 });

    return res.status(200).json({
      data: users,
    });
  } catch (error) {
    next(createError(error, 500));
  }
};

module.exports.getSingle = async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }, { password: 0 });
    if (!user) {
      return next(
        createError(new Error(""), 400, {
          en: "Username not exist.",
          vi: "Username không tồn tại",
        })
      );
    }

    return res.status(200).json({
      data: user,
    });
  } catch (error) {
    next(createError(error, 500));
  }
};

module.exports.changeRole = async (req, res, next) => {
  try {
    const { username, role } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return next(
        createError(new Error(""), 400, {
          en: "Username not exist.",
          vi: "Username không tồn tại",
        })
      );
    }

    user.role = role;
    await user.save();

    return res.status(200).json({
      message: {
        en: "changed role",
        vi: "Đổi role thành công",
      },
    });
  } catch (error) {
    next(createError(error, 500));
  }
};

module.exports.deleteUser = async (req, res, next) => {
  try {
    const { username } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return next(
        createError(new Error(""), 400, {
          en: "Username not exist.",
          vi: "Username không tồn tại",
        })
      );
    }

    await user.remove();

    return res.status(200).json({
      message: {
        en: "deleted",
        vi: "Đã xóa",
      },
    });
  } catch (error) {
    next(createError(error, 500));
  }
};

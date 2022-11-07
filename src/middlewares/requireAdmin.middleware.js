var jwt = require("jsonwebtoken");
// const config = require("config");
const User = require("../models/user.model");
const createError = require("../helpers/errorCreator");

module.exports = async (req, res, next) => {
  try {
    const authHeader =
      req.headers["Authorization"] || req.headers["authorization"];
    if (!authHeader) {
      return next(
        createError(new Error(""), 401, {
          en: "Unauthorized",
          vi: "Yêu cầu đăng nhập",
        })
      );
    }

    // token: Bearer accessToken
    const token = authHeader.split(" ")[1];

    if (!token) {
      return next(
        createError(new Error(""), 401, {
          en: "Unauthorized",
          vi: "Yêu cầu đăng nhập",
        })
      );
    }

    jwt.verify(token, "funix-secret", async (error, decoded) => {
      if (error) {
        if (error.name === "TokenExpiredError") {
          return next(
            createError(new Error(""), 401, {
              en: "Unauthorized: your session is expired.",
              vi: "Yêu cầu đăng nhập: session của bạn đã hết hạn",
            })
          );
        }

        return next(
          createError(new Error(""), 401, {
            en: "Unauthorized",
            vi: "Yêu cầu đăng nhập",
          })
        );
      } else {
        const { username } = decoded;
        const user = await User.findOne({ username });
        if (!user) {
          return next(
            createError(new Error(""), 401, {
              en: "Unauthorized",
              vi: "Yêu cầu đăng nhập",
            })
          );
        }

        if (user.role !== "admin") {
          return next(
            createError(new Error(""), 401, {
              en: "Forbidden",
              vi: "Cấm truy cập (chỉ admin)",
            })
          );
        }

        req.user = user;
        next();
      }
    });
  } catch (error) {
    next(createError(error, 500));
  }
};

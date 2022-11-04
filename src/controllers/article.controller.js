const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Article = require("../models/article.model");
const createError = require("../helpers/errorCreator");

module.exports.addArticle = async (req, res, next) => {
  try {
    // validation
    // const result = validationResult(req);
    // const hasError = !result.isEmpty();
    // if (hasError) {
    //   return res.status(400).json({ message: result.array()[0].msg });
    // }

    const { title, authorId, content } = req.body;

    // check if authorId can cast to ObjectId
    if (!mongoose.Types.ObjectId.isValid(authorId)) {
      return next(
        createError(new Error(""), 400, {
          en: "Can not cast authorId to ObjectId",
          vi: "authorId không hợp lệ",
        })
      );
    }

    await Article.create({
      title,
      authorId,
      content,
    });

    return res.status(200).json({
      message: {
        en: "Created new article",
        vi: "Tạo bài viết thành công",
      },
    });
  } catch (error) {
    next(createError(error, 500));
  }
};

module.exports.editArticle = async (req, res, next) => {
  try {
    // validation
    // const result = validationResult(req);
    // const hasError = !result.isEmpty();
    // if (hasError) {
    //   return res.status(400).json({ message: result.array()[0].msg });
    // }

    const { articleId, title, content } = req.body;

    // check if authorId can cast to ObjectId
    if (!mongoose.Types.ObjectId.isValid(articleId)) {
      return next(
        createError(new Error(""), 400, {
          en: "Can not cast articleId to ObjectId",
          vi: "articleId không hợp lệ",
        })
      );
    }

    await Article.updateOne(
      { articleId },
      {
        $set: {
          title,
          content,
        },
      },
      { upsert: false }
    );

    return res.status(200).json({
      message: {
        en: "Updated the article",
        vi: "Sửa bài viết thành công",
      },
    });
  } catch (error) {
    next(createError(error, 500));
  }
};

module.exports.deleteArticle = async (req, res, next) => {
  try {
    const { articleId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(articleId)) {
      return next(
        createError(new Error(""), 400, {
          en: "Can not cast articleId to ObjectId",
          vi: "articleId không hợp lệ",
        })
      );
    }

    const article = await Article.findOne({ _id: articleId });
    if (!article) {
      return next(
        createError(new Error(""), 400, {
          en: "Article Not Found",
          vi: "Không tìm thấy bài viết",
        })
      );
    }

    await article.remove();
    return res.status(200).json({
      message: {
        en: "Deleted article",
        vi: "Xóa bài viết thành công",
      },
    });
  } catch (error) {
    next(createError(error, 500));
  }
};

module.exports.getArticles = async (req, res, next) => {
  try {
    let { page, limit } = req.query;
    if (!limit) {
      limit = 8;
    }

    if (!page) {
      page = 1;
    }

    const articles = await Tour.find()
      .skip((page - 1) * limit)
      .limit(limit);

    const totalCount = await Tour.countDocuments();
    const remainCount = totalCount - ((page - 1) * limit + articles.length);
    const totalPages = Math.ceil(totalCount / limit);
    const remailPages = totalPages - page;

    return res.status(200).json({
      items: articles,
      totalCount,
      remainCount,
      totalPages,
      remailPages,
    });
  } catch (error) {
    next(createError(error, 500));
  }
};

module.exports.getSingleArticle = async (req, res, next) => {
  try {
    const { articleId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(articleId)) {
      return next(
        createError(new Error(""), 400, {
          en: "Can not cast articleId to ObjectId",
          vi: "articleId không hợp lệ",
        })
      );
    }

    const article = await Article.findOne({ _id: articleId });
    if (!tour) {
      return next(
        createError(new Error(""), 404, {
          en: "Article Not Found",
          vi: "Bài viết không tồn tại",
        })
      );
    }

    // get some random tours
    const relatedArticles = (
      await tour.aggregate([{ $sample: { size: 8 } }])
    ).filter((item) => item._id !== articleId);

    return res.status(200).json({
      item: tour,
      relatedItems: relatedArticles,
    });
  } catch (error) {
    next(createError(error, 500));
  }
};

const mongoose = require("mongoose");
const Article = require("../models/article");
const createError = require("../helpers/errorCreator");
const articleServices = require("../services/article");

module.exports.getArticles = async (req, res, next) => {
  try {
    let { lang, page, page_size } = req.query;
    if (!lang) {
      lang = "vi";
    }

    if (!page) {
      page = 1;
    }

    if (!page_size) {
      page_size = 6;
    }

    let articles = await Article.find()
      .select({
        title: 1,
        lead: 1,
        thumb: 1,
        createdAt: 1,
        is_lang: 1,
        translation: 1,
      })
      .limit(page_size)
      .skip((page - 1) * page_size);

    // metadata
    const total_count = await Article.countDocuments();
    const page_count = Math.ceil(total_count / page_size);
    const remain_count =
      total_count - (page_size * (page - 1) + articles.length);
    const remain_page_count = page_count - page;
    const has_more = page < page_count;

    const metadata = {
      page,
      page_size,
      page_count,
      remain_page_count,
      total_count,
      remain_count,
      has_more,
      lang,
      links: [
        { self: `/article?page=${page}&page_size=${page_size}` },
        { first: `/article?page=${1}&page_size=${page_size}` },
        { previous: `/article?page=${page - 1}&page_size=${page_size}` },
        { next: `/article?page=${page + 1}&page_size=${page_size}` },
        { last: `/article?page=${page_count}&page_size=${page_size}` },
      ],
    };

    const x = articleServices.getItemsWithLang(articles, lang).map((item) => {
      const { content, ...other } = item;
      return other;
    });

    // console.log(x.map((item) => item._id.toString()));

    return res.status(200).json({
      data: x,
      metadata,
    });
  } catch (error) {
    next(createError(error, 500));
  }
};

module.exports.getNewArticles = async (req, res, next) => {
  try {
    let { page, limit } = req.query;
    if (!limit) {
      limit = 8;
    }

    if (!page) {
      page = 1;
    }

    const articles = await Article.find()
      .skip((page - 1) * limit)
      .limit(limit);

    const totalCount = await Article.countDocuments();
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
    const { lang } = req.query;

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
        createError(new Error(""), 404, {
          en: "Article Not Found",
          vi: "Bài viết không tồn tại",
        })
      );
    }

    const relatedArticles = await Article.find({
      _id: {
        $ne: articleId,
      },
    }).limit(3);

    return res.status(200).json({
      data: {
        item: articleServices.getItemWithLang(article, lang),
        relatedItems: articleServices.getItemsWithLang(relatedArticles, lang),
      },
    });
  } catch (error) {
    next(createError(error, 500));
  }
};

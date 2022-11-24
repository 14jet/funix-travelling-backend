const mongoose = require("mongoose");
const Article = require("../../models/article");
const createError = require("../../helpers/errorCreator");
const articleServices = require("../../services/article");
const client_articleServices = require("../../services/client/article");

module.exports.getArticles = async (req, res, next) => {
  try {
    let { lang, page, page_size, cat, sort, search } = req.query;
    if (!lang) {
      lang = "vi";
    }

    if (!page) {
      page = 1;
    }

    if (!page_size) {
      page_size = 6;
    }

    const results = await Article.aggregate(
      client_articleServices.aggCreator({
        page,
        page_size,
        cat,
        sort,
        search,
        lang,
      })
    );

    const articles = results[0].articles;
    const total_count = results[0].count[0]?.total_count || 0;

    // metadata
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
      links: [],
    };

    return res.status(200).json({
      data: client_articleServices.getArticles(articles, lang),
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
        createError(new Error(""), 404, {
          en: "Article Not Found",
          vi: "Bài viết không tồn tại",
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
        item: articleServices.getFullArticle(article, lang),
        relatedItems: articleServices.getArticlesBasicData(
          relatedArticles,
          lang
        ),
      },
    });
  } catch (error) {
    next(createError(error, 500));
  }
};

module.exports.searchForArticles = async (req, res, next) => {
  try {
    let { lang, page, page_size, text } = req.query;
    if (!text) {
      return next(
        createError(new Error(""), 400, {
          en: "Missing search text",
          vi: "Thiếu text",
        })
      );
    }

    if (!page) {
      page = 1;
    }

    if (!page_size) {
      page_size = 6;
    }

    if (!lang) {
      lang = "vi";
    }

    const agg = [
      {
        $search: {
          index: "article",
          autocomplete: { query: text, path: "title" },
          count: {
            type: "total",
          },
        },
      },
      { $skip: (page - 1) * page_size },
      { $limit: page_size },
      {
        $project: {
          _id: 1,
          title: 1,
          thumb: 1,
          lead: 1,
          meta: "$$SEARCH_META",
        },
      },
    ];

    const articles = await Article.aggregate(agg);

    const total_count = articles.length > 0 ? articles[0].meta.count.total : 0;

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
      text,
      links: [],
    };

    return res.status(200).json({
      data: articleServices.getArticlesBasicData(articles, lang),
      metadata,
    });
  } catch (error) {
    next(createError(error, 500));
  }
};

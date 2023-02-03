const Article = require("../../models/article");
const StringHandler = require("../../helpers/stringHandler");

module.exports.getSingleArticle = async (articleId, language) => {
  let article;
  try {
    if (language === "vi") {
      article = await Article.findOne(
        { _id: articleId },
        {
          translation: 0,
        }
      );
    }

    if (language !== "vi") {
      article = await Article.findOne(
        {
          _id: articleId,
          "translation.0": { $exists: true },
          translation: {
            $elemMatch: {
              language: language,
            },
          },
        },
        {
          title: 0,
          content: 0,
          translation: {
            $elemMatch: {
              language: language,
            },
          },
        }
      );
    }

    if (language === "vi" || !article) return [null, article];

    return [
      null,
      {
        _id: article._id,
        language: article.translation[0].language,
        title: article.translation[0].title,
        author: article.author,
        origin: article.origin,
        lead: article.translation[0].lead,
        content: article.translation[0].content,
        thumb: article.thumb,
        banner: article.banner,
        category: article.category,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
      },
    ];
  } catch (error) {
    return [error, null];
  }
};

module.exports.getArticles = async (language) => {
  let articles = [];
  try {
    if (language === "vi") {
      articles = await Article.find(
        {
          thumb: { $ne: "" },
          banner: { $ne: "" },
        },
        {
          translation: 0,
          content: 0,
        }
      );
    }

    if (language !== "vi") {
      articles = await Article.find(
        {
          thumb: { $ne: "" },
          banner: { $ne: "" },
          translation: {
            $elemMatch: {
              language: language,
            },
          },
        },
        {
          content: 0,
          lead: 0,
          translation: {
            $elemMatch: {
              language: language,
            },
          },
        }
      );
    }

    return [null, articles];
  } catch (error) {
    return [error, null];
  }
};

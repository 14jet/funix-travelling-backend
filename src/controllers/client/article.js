const mongoose = require("mongoose");
const createError = require("../../helpers/errorCreator");
const GuidesCategory = require("../../models/guidesCategory");
const articleServices = require("../../services/client/article");

module.exports.getArticles = async (req, res, next) => {
  try {
    let language = req.query.lang || "vi";

    const [err, articles] = await articleServices.getArticles(language);

    if (err) {
      throw new Error(err.message);
    }

    // metadata
    let category = await GuidesCategory.find();
    if (language === "vi") {
      category = category.map((item) => ({
        name: item.name,
        slug: item.slug,
      }));
    } else {
      category = category.map((item) => {
        const transItem = item.translation.find(
          (trans) => trans.language === language
        );
        return { name: transItem.name, slug: item.slug };
      });
    }

    const metadata = {
      total_count: articles.length,
      lang: language,
      category,
    };

    return res.status(200).json({
      data: articles,
      metadata,
    });
  } catch (error) {
    return next(createError(error, 500));
  }
};

module.exports.getSingleArticle = async (req, res, next) => {
  try {
    const { articleId } = req.params;
    const language = req.query.lang || "vi";

    if (!mongoose.Types.ObjectId.isValid(articleId)) {
      return next(
        createError(new Error(""), 404, {
          en: "Article Not Found",
          vi: "Bài viết không tồn tại",
        })
      );
    }

    const [err, article] = await articleServices.getSingleArticle(
      articleId,
      language
    );

    if (err) {
      throw new Error(err.message);
    }

    if (!article) {
      return next(
        createError(new Error(""), 404, {
          en: "Article Not Found",
          vi: "Bài viết không tồn tại",
        })
      );
    }

    return res.status(200).json({
      data: article,
      metadata: {
        lang: language,
      },
    });
  } catch (error) {
    return next(createError(error, 500));
  }
};

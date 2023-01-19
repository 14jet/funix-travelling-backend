const mongoose = require("mongoose");
const Article = require("../../models/article");
const Category = require("../../models/category");
const createError = require("../../helpers/errorCreator");
const { uploadFiles, deleteFiles } = require("../../helpers/firebase");
const { getDeltaImgs } = require("../../helpers/getItineraryImgs");
const { getFullArticle } = require("../../services/article");
const articleServices = require("../../services/admin/article");

module.exports.getArticles_old = async (req, res, next) => {
  try {
    let { lang, page, page_size, cat, sort, search, hot, banner } = req.query;
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
      articleServices.aggCreator({
        page,
        page_size,
        cat,
        sort,
        search,
        lang,
        hot,
        banner,
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
      data: articleServices.getArticles(articles, lang),
      metadata,
    });
  } catch (error) {
    next(createError(error, 500));
  }
};

module.exports.getArticles = async (req, res, next) => {
  try {
    const articles = await Article.find({});

    console.log(articles);
    return res.status(200).json({
      data: articles,
    });
  } catch (error) {
    return next(createError(error, 500));
  }
};

module.exports.addArticle = async (req, res, next) => {
  try {
    let { title, author, origin, lead, content, category, hot, layout } =
      req.body;
    const thumb = req.files["thumb"][0];
    const banner = req.files["banner"][0];

    const thumbUrl = (await uploadFiles([thumb]))[0];
    const bannerUrl = (await uploadFiles([banner]))[0];

    // lấy image base64
    let contentImgs = [];
    JSON.parse(content).ops.forEach((item) => {
      if (item.insert.image) {
        contentImgs.push(item.insert.image.src);
        // contentImgs.push(item.insert.image);
        // console.log(item.insert.image);
      }
    });

    // lấy hình mới thêm vào (là hình base64)
    let base64Imgs = contentImgs.filter((item) => {
      console.log(item);
      return item.startsWith("data:image");
    });

    // upload lên firebase
    const imageURLs = await uploadFiles(base64Imgs, true);

    // thay tương ứng vào content
    base64Imgs.forEach((item, index) => {
      content = content.replace(item, imageURLs[index]);
    });

    const newArticle = await Article.create({
      title,
      author,
      origin,
      lead,
      hot: hot === "true" ? true : false,
      category: JSON.parse(category),
      layout: JSON.parse(layout),
      banner: bannerUrl,
      thumb: thumbUrl,
      content: JSON.parse(content),
    });

    // handle banner
    if (banner === "true") {
      const old_banner_tour = await Tour.findOne({ banner: true });
      if (old_banner_tour) {
        old_banner_tour.banner = false;
      }
    }

    return res.status(200).json({
      message: {
        en: "Created new article",
        vi: "Tạo bài viết thành công",
      },
      data: newArticle,
    });
  } catch (error) {
    next(createError(error, 500));
  }
};

module.exports.getSingleArticle = async (req, res, next) => {
  try {
    let { articleId } = req.params;
    let { cat_lang } = req.query;
    if (!cat_lang) {
      cat_lang = "vi";
    }

    const article = await Article.findOne({ _id: articleId });
    const available_lang = article.translation.map((item) => item.language);

    const has_lang =
      cat_lang === "vi" ||
      article.translation.find((item) => item.language === cat_lang);

    const data = has_lang ? getFullArticle(article, cat_lang) : null;
    const original = getFullArticle(article, "vi");

    const categories = await Category.find().populate("parent");

    return res.status(200).json({
      data: data,
      metadata: {
        available_lang,
        categories,
        original: original,
      },
    });
  } catch (error) {
    return next(createError(error, 500));
  }
};

module.exports.updateArticle = async (req, res, next) => {
  try {
    let {
      title,
      author,
      origin,
      lead,
      content,
      language,
      articleId,
      category,
      hot,
      layout,
    } = req.body;

    const article = await Article.findOne({ _id: articleId });
    if (!article) {
      return next(
        createError(new Error(""), 400, {
          en: "Article Not Found",
          vi: "Không tìm thấy bài viết",
        })
      );
    }

    // upload new base64 imgs in content
    let base64Imgs = JSON.parse(content)
      .ops.map((item) => (item.insert?.image ? item.insert.image.src : null))
      .filter((item) => item && item.startsWith("data:image"));

    const imageURLs = await uploadFiles(base64Imgs, true);

    base64Imgs.forEach((item, index) => {
      content = content.replace(item, imageURLs[index]);
    });

    // xóa hình cũ
    const oldContent =
      language === "vi" ? article.content : article.translation[0]?.content;

    if (oldContent) {
      let oldImgs = [];
      oldContent.ops.forEach((item) => {
        if (item.insert?.image && !content.includes(item.insert.image.src)) {
          oldImgs.push(item.insert.image.src);
        }
      });

      deleteFiles(oldImgs);
    }

    if (language === "vi") {
      article.title = title;
      article.author = author;
      article.origin = origin;
      article.lead = lead;
      article.layout = JSON.parse(layout);
      article.content = JSON.parse(content);
      article.hot = hot === "true" || hot === true ? true : false;
    }

    if (language !== "vi") {
      let tid = article.translation.findIndex(
        (item) => item.language === language
      );
      if (tid === -1) {
        article.translation.push({
          title,
          origin,
          lead,
          content: JSON.parse(content),
          language,
        });
      } else {
        article.translation[tid].title = title;
        article.translation[tid].origin = origin;
        article.translation[tid].lead = lead;
        article.translation[tid].content = JSON.parse(content);
      }
    }

    const thumb = req.files["thumb"] && req.files["thumb"][0];
    const banner = req.files["banner"] && req.files["banner"][0];

    if (thumb) {
      const thumbUrl = (await uploadFiles([thumb]))[0];
      deleteFiles([article.thumb]);
      article.thumb = thumbUrl;
    }

    if (banner) {
      const bannerUrl = (await uploadFiles([banner]))[0];
      deleteFiles([article.banner]);
      article.banner = bannerUrl;
    }

    console.log(article.hot);

    article.hot = hot === "true" || hot === true ? true : false;
    article.category = JSON.parse(category);

    // handle banner
    if (banner === "true") {
      const old_banner_tour = await Tour.findOne({ banner: true });
      if (old_banner_tour) {
        old_banner_tour.banner = false;
      }
    }

    await article.save();
    return res.status(200).json({
      code: 200,
      message: {
        en: "Updated",
        vi: "Đã cập nhật",
      },
    });
  } catch (error) {
    return next(createError(error, 500));
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

    let imgs = getDeltaImgs(article.content).concat([article.thumb]);

    deleteFiles(imgs);

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

const Article = require("../../models/article");
const createError = require("../../helpers/errorCreator");
const {
  uploadArticleImg,
  getBase64ImgsFromQuillDelta,
  uploadBase64ImgsToGC,
} = require("../../services/admin/article");
const { deleteFileFromGC } = require("../../helpers/firebase-admin");
const StringHandler = require("../../helpers/stringHandler");
const ArticleCounter = require("../../models/articleCounter");

module.exports.getArticles = async (req, res, next) => {
  try {
    const articles = await Article.find(
      {},
      {
        content: 0,
        translation: 0,
      }
    );

    return res.status(200).json({
      data: articles,
    });
  } catch (error) {
    return next(createError(error, 500));
  }
};

module.exports.addArticle = async (req, res, next) => {
  try {
    let articleString = req.body.article;
    let article = JSON.parse(articleString);

    const thumb = req.files.thumb[0];
    const banner = req.files.banner[0];

    const thumbUrl = await uploadArticleImg(thumb, article.title);
    const bannerUrl = await uploadArticleImg(banner, article.title);

    // lấy image base64
    let base64Imgs = getBase64ImgsFromQuillDelta(article.content);
    base64Imgs = base64Imgs.map((item) => ({
      ...item,
      articleTitle: article.title,
    }));
    const imageURLs = await uploadBase64ImgsToGC(base64Imgs);
    base64Imgs.forEach((item, index) => {
      articleString = articleString.replaceAll(item.src, imageURLs[index]);
    });

    // slug
    let counter = await ArticleCounter.findOne({});
    if (!counter) {
      counter = ArticleCounter.create({ counter: 0 });
    }

    const slug = StringHandler.slugify(article.title) + "-" + counter.counter;
    counter.counter += 1;
    await counter.save();

    const newArticle = await Article.create({
      ...JSON.parse(articleString),
      banner: bannerUrl,
      thumb: thumbUrl,
      slug: slug,
    });

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

module.exports.updateArticle = async (req, res, next) => {
  try {
    let articleString = req.body.article;
    let articleObj = JSON.parse(articleString);

    let article = await Article.findOne({ _id: articleObj._id });

    // handle: upload hình base64 mới trong content
    let base64Imgs = getBase64ImgsFromQuillDelta(articleObj.content);
    base64Imgs = base64Imgs.map((item) => ({
      ...item,
      articleTitle: article.title,
    }));
    const imageURLs = await uploadBase64ImgsToGC(base64Imgs);
    base64Imgs.forEach((item, index) => {
      articleString = articleString.replaceAll(item.src, imageURLs[index]);
    });

    // xóa hình cũ
    let oldImgs = [];
    article.content.ops.forEach((item) => {
      if (
        item.insert?.image &&
        !articleString.includes(item.insert.image.src)
      ) {
        oldImgs.push(item.insert.image.src);
      }
    });

    oldImgs.forEach((url) => {
      deleteFileFromGC(url).catch((err) => {
        console.error(err);
      });
    });

    // thumbnail and banner
    const thumb = req.files.thumb && req.files.thumb[0];
    const banner = req.files.banner && req.files.banner[0];
    let thumbUrl = article.thumb;
    let bannerUrl = article.banner;

    if (thumb) {
      thumbUrl = await uploadArticleImg(thumb, article.title);
      deleteFileFromGC(article.thumb).catch((err) => {
        console.error(err);
      });
    }

    if (banner) {
      bannerUrl = await uploadArticleImg(banner, article.title);
      deleteFileFromGC(article.banner).catch((err) => {
        console.error(err);
      });
    }

    // slug
    let counter = await ArticleCounter.findOne({});
    if (!counter) {
      counter = ArticleCounter.create({ counter: 0 });
    }

    const slug = StringHandler.slugify(title) + "-" + counter.counter;
    counter.counter += 1;
    await counter.save();

    // save
    const { title, content, author, origin, category, translation } =
      JSON.parse(articleString);

    article.title = title;
    article.slug = slug;
    article.content = content;
    article.author = author;
    article.origin = origin;
    article.category = category;
    article.translation = translation;
    article.thumb = thumbUrl;
    article.banner = bannerUrl;

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

module.exports.getSingleArticle = async (req, res, next) => {
  try {
    let { articleId } = req.params;

    const article = await Article.findOne({ _id: articleId });

    return res.status(200).json({
      data: article,
    });
  } catch (error) {
    return next(createError(error, 500));
  }
};

module.exports.deleteArticle = async (req, res, next) => {
  try {
    const { articleId } = req.body;

    const article = await Article.findOne({ _id: articleId });
    if (!article) {
      return next(
        createError(new Error(""), 400, {
          en: "Article Not Found",
          vi: "Không tìm thấy bài viết",
        })
      );
    }

    deleteFileFromGC(article.thumb);
    deleteFileFromGC(article.banner);
    let imgs = article.content.ops
      .filter((item) => item.insert?.image)
      .map((item) => item.insert.image.src);

    article.translation.forEach((trans) => {
      trans.content.ops.forEach((item) => {
        if (item.insert.image) {
          imgs.push(item.insert.image.src);
        }
      });
    });

    imgs.forEach((url) => {
      deleteFileFromGC(url).catch((err) => console.error(err));
    });

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

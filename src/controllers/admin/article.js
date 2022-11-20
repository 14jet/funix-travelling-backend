const mongoose = require("mongoose");
const Article = require("../../models/article");
const Category = require("../../models/category");
const createError = require("../../helpers/errorCreator");
const uploadFilesToFirebase = require("../../helpers/uploadFilesToFirebase");
const deleteFilesFromFirebase = require("../../helpers/deleteFilesFromFirebase");
const { getDeltaImgs } = require("../../helpers/getItineraryImgs");
const { getFullArticle } = require("../../services/article");
const { imgResizer } = require("../../helpers/imgResizer");

module.exports.addArticle = async (req, res, next) => {
  try {
    let { title, author, origin, lead, content, category } = req.body;
    const thumb = req.file;

    const [error, resizedImg] = await imgResizer(thumb.buffer);

    let thumbUrl;
    if (resizedImg) {
      thumbUrl = (
        await uploadFilesToFirebase([
          { buffer: resizedImg, originalname: thumb.originalname },
        ])
      )[0];
    } else {
      thumbUrl = (await uploadFilesToFirebase([thumb]))[0];
    }

    // lấy image base64
    let contentImgs = [];
    JSON.parse(content).ops.forEach((item) => {
      if (item.insert.image) {
        contentImgs.push(item.insert.image);
      }
    });

    // lấy hình mới thêm vào (là hình base64)
    let base64Imgs = contentImgs.filter((item) =>
      item.startsWith("data:image")
    );

    // upload lên firebase
    const imageURLs = await uploadFilesToFirebase(base64Imgs, true);

    // thay tương ứng vào content
    base64Imgs.forEach((item, index) => {
      content = content.replace(item, imageURLs[index]);
    });

    const newArticle = await Article.create({
      title,
      author,
      origin,
      lead,
      category: JSON.parse(category),
      thumb: thumbUrl,
      content: JSON.parse(content),
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
    next(createError(error, 500));
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
    } = req.body;
    const thumb = req.file;

    const article = await Article.findOne({ _id: articleId });

    // upload new base64 img in content
    let base64Imgs = JSON.parse(content)
      .ops.map((item) => (item.insert?.image ? item.insert.image : null))
      .filter((item) => item && item.startsWith("data:image"));

    const imageURLs = await uploadFilesToFirebase(base64Imgs, true);

    base64Imgs.forEach((item, index) => {
      content = content.replace(item, imageURLs[index]);
    });

    // xóa hình cũ
    const oldContent =
      language === "vi"
        ? article.content
        : article.translation.find((item) => item.language === language)
            ?.content;

    if (oldContent) {
      let oldImgs = [];
      oldContent.ops.forEach((item) => {
        if (item.insert?.image && !content.includes(item.insert.image)) {
          oldImgs.push(item.insert.image);
        }
      });

      deleteFilesFromFirebase(oldImgs);
    }

    if (language === "vi") {
      article.title = title;
      article.author = author;
      article.origin = origin;
      article.lead = lead;
      article.content = JSON.parse(content);
    }

    if (language === "en") {
      let tid = article.translation.findIndex((item) => item.language === "en");
      if (tid === -1) {
        article.translation.push({
          title,
          author,
          origin,
          lead,
          content: JSON.parse(content),
          language,
        });
      } else {
        article.translation[tid].title = title;
        article.translation[tid].language = language;
        article.translation[tid].author = author;
        article.translation[tid].origin = origin;
        article.translation[tid].lead = lead;
        article.translation[tid].content = JSON.parse(content);
      }
    }

    let thumbUrl;
    if (thumb) {
      const [error, resizedImg] = await imgResizer(thumb.buffer);
      if (resizedImg) {
        thumbUrl = (
          await uploadFilesToFirebase([
            { buffer: resizedImg, originalname: thumb.originalname },
          ])
        )[0];
      } else {
        thumbUrl = (await uploadFilesToFirebase([thumb]))[0];
      }

      deleteFilesFromFirebase([article.thumb]);
      article.thumb = thumbUrl;
    }

    article.category = JSON.parse(category);
    console.log(category);

    await article.save();
    return res.status(200).json({
      code: 200,
      message: {
        en: "Updated",
        vi: "Đã cập nhật",
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

    let imgs = getDeltaImgs(article.content).concat([article.thumb]);

    deleteFilesFromFirebase(imgs);

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

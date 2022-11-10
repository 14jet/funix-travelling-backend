const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Article = require("../models/article");
const createError = require("../helpers/errorCreator");
const fbStorage = require("../helpers/firebase");
const {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  uploadString,
} = require("firebase/storage");
const { v4: uuid } = require("uuid");
const getExt = require("../helpers/getFileExtension");
const getItineraryImgs = require("../helpers/getItineraryImgs");
module.exports.addArticle = async (req, res, next) => {
  try {
    // validation
    // const result = validationResult(req);
    // const hasError = !result.isEmpty();
    // if (hasError) {
    //   return res.status(400).json({ message: result.array()[0].msg });
    // }

    const title = req.body.title;
    const content = JSON.parse(req.body.content).ops;

    // lấy image base64
    const imagebase64 = () => {
      const img = [];
      content.map((item) => {
        item.insert.image ? img.push(item.insert.image) : item;
      });
      console.log(img);
      return img;
    };

    // lấy hình mới thêm vào (là hình base64)
    const newImgs = imagebase64().filter((text) =>
      text.startsWith("data:image")
    );
    console.log("newImgs", newImgs);
    // upload lên firebase
    let refs = newImgs.map((text) => {
      return {
        base64text: text,
        ref: ref(fbStorage, "images/" + uuid() + "." + getExt.base64(text)[1]),
      };
    });

    await Promise.all(
      refs.map((ref) => {
        return uploadString(ref.ref, ref.base64text, "data_url");
      })
    );

    const imageURLs = await Promise.all(
      refs.map((ref) => getDownloadURL(ref.ref))
    );
    console.log("imageURLs", imageURLs);

    // ráp url ảnh mới upload lên firebase vào mảng refs
    refs = refs.map((item, index) => ({ ...item, newUrl: imageURLs[index] }));
    console.log("refs", refs);
    // thay tương ứng vào content
    let contentText = JSON.stringify(content);
    refs.forEach((item) => {
      contentText = contentText.replace(item.base64text, item.newUrl);
    });

    await Article.create({
      title,
      content: JSON.parse(contentText),
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
    const { postsId, title } = req.body;
    const content = JSON.parse(req.body.content).ops;

    // check if authorId can cast to ObjectId
    if (!mongoose.Types.ObjectId.isValid(postsId)) {
      return next(
        createError(new Error(""), 400, {
          en: "Can not cast articleId to ObjectId",
          vi: "articleId không hợp lệ",
        })
      );
    }
    console.log("content", content);
    const article = await Article.findOne({ _id: postsId });

    //lấy image mới thêm vào base64
    const imagebase64 = () => {
      const img = [];
      content.map((item) => {
        item.insert.image ? img.push(item.insert.image) : item;
      });
      console.log(img);
      return img;
    };

    // lấy url image trong bài viết củ
    const urlImageRemove = () => {
      const img = [];
      article.content.map((item) => {
        item.insert.image ? img.push(item.insert.image) : item;
      });
      console.log(img);
      return img;
    };

    // lấy hình đã xóa:
    const removedImgs = urlImageRemove().filter(
      (img) => !JSON.stringify(content).includes(img)
    );

    // xóa hình
    for (const image of removedImgs) {
      deleteObject(ref(fbStorage, image))
        .then(() => {
          return true;
        })
        .catch((error) => {
          console.error(error);
        });
    }

    // lấy hình mới thêm vào (là hình base64)
    const newImgs = imagebase64().filter((text) =>
      text.startsWith("data:image")
    );
    console.log("newImgs", newImgs);
    // upload lên firebase
    let refs = newImgs.map((text) => {
      return {
        base64text: text,
        ref: ref(fbStorage, "images/" + uuid() + "." + getExt.base64(text)[1]),
      };
    });

    await Promise.all(
      refs.map((ref) => {
        return uploadString(ref.ref, ref.base64text, "data_url");
      })
    );

    const imageURLs = await Promise.all(
      refs.map((ref) => getDownloadURL(ref.ref))
    );
    console.log("imageURLs", imageURLs);

    // ráp url ảnh mới upload lên firebase vào mảng refs
    refs = refs.map((item, index) => ({ ...item, newUrl: imageURLs[index] }));
    console.log("refs", refs);
    // thay tương ứng vào content
    let contentText = JSON.stringify(content);
    refs.forEach((item) => {
      contentText = contentText.replace(item.base64text, item.newUrl);
    });

    await Article.updateOne(
      { _id: postsId },
      {
        $set: {
          title,
          content: JSON.parse(contentText),
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
    const { articleId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(articleId)) {
      return next(
        createError(new Error(""), 400, {
          en: "Can not cast articleId to ObjectId",
          vi: "articleId không hợp lệ",
        })
      );
    }

    const articleDelete = await Article.findOne({ _id: articleId });

    // lấy url image trong bài viết củ
    const urlImageRemove = () => {
      const img = [];
      articleDelete.content.map((item) => {
        item.insert.image ? img.push(item.insert.image) : item;
      });
      console.log(img);
      return img;
    };

    // lấy hình để xóa:
    const removedImgs = urlImageRemove();

    // xóa hình
    for (const image of removedImgs) {
      deleteObject(ref(fbStorage, image))
        .then(() => {
          return true;
        })
        .catch((error) => {
          console.error(error);
        });
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

    if (!mongoose.Types.ObjectId.isValid(articleId)) {
      return next(
        createError(new Error(""), 400, {
          en: "Can not cast articleId to ObjectId",
          vi: "articleId không hợp lệ",
        })
      );
    }

    const article = await Article.findOne({ _id: articleId });
    if (!Article) {
      return next(
        createError(new Error(""), 404, {
          en: "Article Not Found",
          vi: "Bài viết không tồn tại",
        })
      );
    }

    return res.status(200).json({
      article,
    });
  } catch (error) {
    next(createError(error, 500));
  }
};

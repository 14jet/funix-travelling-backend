module.exports.getArticleBasicData = (article, lang) => {
  const article_vi = {
    _id: article._id,
    title: article.title,
    lead: article.lead,
    category: article.category,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    thumb: article.thumb,
  };

  if (lang === "vi" || !article.translation) {
    return article_vi;
  }

  if (lang !== "vi") {
    const trans = article.translation.find((item) => item.language === lang);
    if (!trans) {
      return article_vi;
    }

    return {
      ...article_vi,
      title: trans.title,
      lead: trans.lead,
    };
  }
};

module.exports.getFullArticle = (article, lang) => {
  const article_vi = {
    _id: article._id,
    title: article.title,
    lead: article.lead,
    category: article.category,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    thumb: article.thumb,
    author: article.author,
    content: article.content,
  };

  if (lang === "vi" || !article.translation) {
    return article_vi;
  }

  if (lang !== "vi") {
    const trans = article.translation.find((item) => item.language === lang);
    if (!trans) {
      return article_vi;
    }

    return {
      ...article_vi,
      title: trans.title,
      lead: trans.lead,
      author: trans.author,
      content: trans.content,
    };
  }
};

module.exports.getArticlesBasicData = (articles, lang) => {
  return articles.map((item) => this.getArticleBasicData(item, lang));
};

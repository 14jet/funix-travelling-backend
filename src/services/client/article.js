module.exports.aggCreator = (queries) => {
  const notEmpty = (obj) => Object.keys(obj).length > 0;

  let { cat, page, page_size, sort, search, lang } = queries;
  if (!Array.isArray(cat)) {
    cat = [cat];
  }

  let $search = {};
  let $match = {};
  let $skip = {};
  let $limit = {};
  let $sort = {};

  if (!page) {
    page = 1;
  }
  if (!page_size) {
    page_size = 6;
  }

  // category
  if (cat) {
    $match = { ...$match, category: { $in: cat } };
  }

  if (sort === "time-desc") {
    $sort = { ...$sort, updatedAt: -1 };
  }

  if (sort === "time-asc") {
    $sort = { ...$sort, updatedAt: 1 };
  }

  // search
  if (search) {
    $search =
      lang === "vi"
        ? {
            index: "article",
            compound: {
              should: [
                {
                  autocomplete: {
                    query: search,
                    path: "title",
                  },
                },
              ],
            },
          }
        : {
            index: "article",
            compound: {
              should: [
                {
                  embeddedDocument: {
                    path: "translation",
                    operator: {
                      compound: {
                        should: [
                          {
                            autocomplete: {
                              path: "translation.title",
                              query: search,
                            },
                          },
                        ],
                      },
                    },
                  },
                },
              ],
            },
          };
  }

  // limit
  $limit = Number(page_size);

  // skip
  $skip = (Number(page) - 1) * Number(page_size);

  let agg = [];
  if (notEmpty($search)) {
    agg.push({ $search });
  }

  if (notEmpty($match)) {
    agg.push({ $match });
  }

  agg.push({
    $facet: {
      articles: [{ $skip: 0 }, { $limit: 6 }],
      count: [
        {
          $count: "total_count",
        },
      ],
    },
  });

  agg.push({ $skip });
  agg.push({ $limit });

  if (notEmpty($sort)) {
    agg.push({ $sort });
  }

  return agg;
};

module.exports.getSingleArticle = (article, language = "vi") => {
  const origin = {
    _id: article._id,
    language: article.language,

    title: article.title,
    lead: article.lead,
    thumb: article.thumb,
    author: article.author,
    lead: article.lead,
    content: article.content,
    updatedAt: article.updatedAt,

    is_requested_lang: true,
  };
  if (language === "vi") {
    return origin;
  }

  if (language !== "vi") {
    const tid = article.translation.findIndex(
      (item) => item.language === language
    );
    if (tid === -1) {
      return { ...origin, is_requested_lang: false };
    }

    const t = article.translation[tid];

    return {
      ...origin,
      language: t.language,

      title: t.title,
      lead: t.lead,
      content: t.content,
    };
  }
};

module.exports.getArticles = (articles, language = "vi") => {
  const results = articles.map((item) => {
    const article = this.getSingleArticle(item, language);
    return {
      _id: article._id,
      language: article.language,
      title: article.title,
      lead: article.lead,
      thumb: article.thumb,
      author: article.author,
      lead: article.lead,
      updatedAt: article.updatedAt,
    };
  });

  return results;
};

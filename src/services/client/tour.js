module.exports.getSingleTour = (tour, language = "vi") => {
  const slider = tour.itinerary
    .map((item) => item.images)
    .reduce((prev, cur) => {
      return [...prev, ...cur];
    }, []);
  const origin = {
    _id: tour._id,
    language: tour.language,

    code: tour.code,
    name: tour.name,
    thumb: tour.thumb,
    slider: slider,
    price: tour.price,

    countries: tour.countries,
    journey: tour.journey,
    category: tour.category,
    description: tour.description,
    highlights: tour.highlights,

    duration: tour.duration,
    departureDates: tour.departureDates,

    price_policies: tour.price_policies,
    terms: tour.terms,

    rating: tour.rating,
    itinerary: tour.itinerary,

    is_requested_lang: true,
  };
  if (language === "vi") {
    return origin;
  }

  if (language !== "vi") {
    const tid = tour.translation.findIndex(
      (item) => item.language === language
    );
    if (tid === -1) {
      return { ...origin, is_requested_lang: false };
    }

    const t = tour.translation[tid];
    const trans_itinerary = t.itinerary.map((item, index) => ({
      ...item,
      images: tour.itinerary[index].images,
    }));

    const trans_rating_items = tour.rating.items.map((item, index) => ({
      _id: item._id,
      name: item.name,
      stars: item.stars,
      content: t.rating[index].content,
    }));

    return {
      ...origin,
      language: t.language,

      name: t.name,

      countries: t.countries,
      journey: t.journey,
      description: t.description,
      highlights: t.highlights,

      price_policies: t.price_policies,
      terms: t.terms,

      rating: {
        average: tour.average,
        items: trans_rating_items,
      },
      itinerary: trans_itinerary,
    };
  }
};

module.exports.getTours = (tours, language = "vi") => {
  const results = tours.map((item) => {
    const tour = this.getSingleTour(item, language);
    return {
      _id: tour._id,
      language: tour.language,
      code: tour.code,
      name: tour.name,
      thumb: tour.thumb,
      countries: tour.countries,
      journey: tour.journey,
      price: tour.price,
    };
  });

  return results;
};

module.exports.aggCreator = (queries) => {
  const notEmpty = (obj) => Object.keys(obj).length > 0;

  let { cat, cat_not, page, page_size, sort, search, lang } = queries;

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

  if (cat_not) {
    $match = { ...$match, category: { $nin: cat } };
  }

  // sort
  if (sort === "price-desc") {
    $sort = { ...$sort, price: -1 };
  }

  if (sort === "price-asc") {
    $sort = { ...$sort, price: 1 };
  }

  if (sort === "duration-desc") {
    $sort = { ...$sort, "duration.days": -1 };
  }

  if (sort === "duration-asc") {
    $sort = { ...$sort, "duration.days": 1 };
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
            compound: {
              should: [
                {
                  autocomplete: {
                    query: search,
                    path: "name",
                  },
                },
                {
                  autocomplete: {
                    query: search,
                    path: "journey",
                  },
                },
                {
                  autocomplete: {
                    query: search,
                    path: "countries",
                  },
                },
              ],
            },
          }
        : {
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
                              path: "translation.name",
                              query: search,
                            },
                          },
                          {
                            autocomplete: {
                              path: "translation.countries",
                              query: search,
                            },
                          },
                          {
                            autocomplete: {
                              path: "translation.journey",
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
      tours: [{ $skip: 0 }, { $limit: 6 }],
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
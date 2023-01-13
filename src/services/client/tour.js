module.exports.getSingleTour = (tour, language = "vi") => {
  const slider = tour.itinerary
    .map((item) => item.images)
    .reduce((prev, cur) => {
      return [...prev, ...cur];
    }, []);

  const origin = {
    _id: tour._id,
    language: tour.language,
    url_endpoint: tour.url_endpoint,

    code: tour.code,
    name: tour.name,
    thumb: tour.thumb,
    banner: tour.banner,
    layout: tour.layout || [],
    price: tour.price,
    slider: slider,
    hot: tour.hot,

    journey: tour.journey,
    destinations: tour.destinations,
    description: tour.description,
    highlights: tour.highlights,

    duration: tour.duration,
    departure_dates: tour.departure_dates,

    price_policies: tour.price_policies,
    terms: tour.terms,

    rating: tour.rating,
    itinerary: tour.itinerary,

    is_requested_lang: true,
    updated_at: tour.updatedAt,
  };

  const countries = tour.destinations.map((item) => item.country);
  const is_vn_tour = tour.destinations.every(
    (item) => item.country === "vietnam"
  );
  const is_eu_tour = tour.destinations.some(
    (item) => item.continent === "europe"
  );

  origin.countries = countries;
  origin.is_vn_tour = is_vn_tour;
  origin.is_eu_tour = is_eu_tour;

  if (language === "vi") return origin;

  const tid = tour.translation.findIndex((item) => item.language === language);
  if (tid === -1) {
    return { ...origin, is_requested_lang: false };
  }

  const t = tour.translation[tid];
  const trans_itinerary = t.itinerary.map((item, index) => ({
    ...item,
    images: tour.itinerary[index].images,
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

    itinerary: trans_itinerary,
  };
};

module.exports.getTours = (tours, language = "vi") => {
  const results = tours.map((item) => {
    const tour = this.getSingleTour(item, language);
    return {
      _id: tour._id,
      language: tour.language,
      url_endpoint: tour.url_endpoint,
      hot: tour.hot,
      code: tour.code,
      name: tour.name,
      thumb: tour.thumb,
      layout: tour.layout || [],
      countries: tour.countries,
      destinations: tour.destinations,
      is_vn_tour: tour.is_vn_tour,
      is_eu_tour: tour.is_eu_tour,
      journey: tour.journey,
      price: tour.price,
      duration: tour.duration,
      updated_at: tour.updated_at,
      banner: tour.banner,
    };
  });

  return results;
};

module.exports.aggCreator = (queries) => {
  const notEmpty = (obj) => Object.keys(obj).length > 0;

  let {
    cat,
    cat_not,
    page,
    page_size,
    sort,
    search,
    lang,
    hot,
    slider,
    banner,
  } = queries;
  if (cat && !Array.isArray(cat)) {
    cat = [cat];
  }

  if (cat_not && !Array.isArray(cat_not)) {
    cat_not = [cat_not];
  }

  let $search = {};
  let $match = {};
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
    $match = { ...$match, category: { $nin: cat_not } };
  }

  if (hot === "1") {
    $match = { ...$match, hot: true };
  }

  if (hot === "0") {
    $match = { ...$match, hot: false };
  }

  if (banner) {
    $match = { ...$match, layout: { $in: [banner] } };
  }

  if (slider === "0") {
    $match = { ...$match, slider: "" };
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

  if (Object.keys($sort).length === 0) {
    $sort = { updatedAt: 1 };
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
                    path: "code",
                  },
                },
                {
                  phrase: {
                    query: search,
                    path: "code",
                    score: { boost: { value: 15 } },
                    slop: 5,
                  },
                },
                {
                  autocomplete: {
                    query: search,
                    path: "name",
                  },
                },
                {
                  phrase: {
                    query: search,
                    path: "name",
                    score: { boost: { value: 15 } },
                    slop: 5,
                  },
                },
                {
                  autocomplete: {
                    query: search,
                    path: "journey",
                  },
                },
                {
                  phrase: {
                    query: search,
                    path: "journey",
                    score: { boost: { value: 15 } },
                    slop: 5,
                  },
                },
                {
                  autocomplete: {
                    query: search,
                    path: "countries",
                  },
                },
                {
                  phrase: {
                    query: search,
                    path: "countries",
                    score: { boost: { value: 15 } },
                    slop: 5,
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

  let agg = [];
  if (notEmpty($search)) {
    agg.push({ $search });
  }

  if (notEmpty($match)) {
    agg.push({ $match });
  }

  if (!search) {
    agg.push({ $sort });
  }

  agg.push({
    $facet: {
      tours: [
        { $skip: (Number(page) - 1) * Number(page_size) },
        { $limit: Number(page_size) },
      ],
      count: [
        {
          $count: "total_count",
        },
      ],
    },
  });

  return agg;
};

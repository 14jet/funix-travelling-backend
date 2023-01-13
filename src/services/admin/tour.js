module.exports.getSingleTour = (tour, language) => {
  const originalTour = {
    language: tour.language,
    _id: tour._id,
    code: tour.code,
    hot: tour.hot,
    name: tour.name,
    url_endpoint: tour.url_endpoint,

    journey: tour.journey,
    description: tour.description,
    highlights: tour.highlights,
    destinations: tour.destinations,

    price: tour.price,
    duration: tour.duration,
    departure_dates: tour.departure_dates,

    price_policies: tour.price_policies,
    terms: tour.terms,

    thumb: tour.thumb,
    banner: tour.banner,
    layout: tour.layout,
    rating: tour.rating,

    itinerary: tour.itinerary,
  };

  if (language === "vi") return originalTour;

  const tid = tour.translation.findIndex((item) => item.language === language);

  if (tid === -1) return originalTour;

  const { _id, ...rest } = tour.translation[tid]._doc;

  let itinerary = [];
  tour.translation[tid].itinerary.forEach((item, index) => {
    itinerary.push({
      id: item.id,
      day: item.day,
      destination: item.destination,
      content: item.content,
      images: tour.itinerary[index].images,
    });
  });
  return { ...originalTour, ...rest, itinerary: itinerary };
};

module.exports.serializeTour = (tour, language = "vi") => {
  const slider = tour.itinerary
    .map((item) => item.images)
    .reduce((prev, cur) => {
      return [...prev, ...cur];
    }, []);

  const origin = {
    language: tour.language,

    _id: tour._id,
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
    departureDates: tour.departureDates,

    price_policies: tour.price_policies,
    terms: tour.terms,

    rating: tour.rating,
    itinerary: tour.itinerary,

    is_requested_lang: true,
  };

  // *********** Nước (chỉ dành cho tour châu Âu) ***************
  let countries = Array.from(
    new Set(tour.destinations.map((item) => item.country))
  );

  origin.countries = countries;

  // Tỉnh (chỉ dành cho tour việt nam) ***************
  let provinces = Array.from(
    new Set(tour.destinations.map((item) => item.province))
  );
  origin.provinces = provinces;

  // các versions ngôn ngữ hiện có
  let language_versions = tour.translation
    .map((item) => item.language)
    .concat(["vi"]);
  origin.language_versions = language_versions;

  // các versions lộ trình ngôn ngữ hiện có
  let itinerary_language_versions = [];
  if (tour.itinerary.length > 0) {
    itinerary_language_versions.push("vi");
  }

  tour.translation.forEach((item) => {
    if (item.itinerary && item.itinerary.length > 0) {
      itinerary_language_versions.push(item.language);
    }
  });

  origin.itinerary_language_versions = itinerary_language_versions;

  // hình ảnh lộ trình
  const missingItineraryImages = tour.itinerary.every(
    (item) => !item.images || item.images.length === 0
  );

  origin.missingItineraryImages = missingItineraryImages;

  return origin;
};

module.exports.getTours = (tours, language = "vi", itinerary) => {
  const results = tours.map((item) => {
    const tour = this.serializeTour(item, language);
    return tour;
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

const Tour = require("../../models/tour");

module.exports.destinationsLookup = [
  {
    $lookup: {
      from: "destinations",
      localField: "destinations",
      foreignField: "_id",
      as: "destinations",
    },
  },
  {
    $unwind: {
      path: "$destinations",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $lookup: {
      from: "destinations",
      localField: "destinations.continent",
      foreignField: "_id",
      as: "destinations.continent",
    },
  },
  {
    $lookup: {
      from: "destinations",
      localField: "destinations.country",
      foreignField: "_id",
      as: "destinations.country",
    },
  },
  {
    $lookup: {
      from: "destinations",
      localField: "destinations.region",
      foreignField: "_id",
      as: "destinations.region",
    },
  },
  {
    $lookup: {
      from: "destinations",
      localField: "destinations.province",
      foreignField: "_id",
      as: "destinations.province",
    },
  },
  {
    $lookup: {
      from: "destinations",
      localField: "destinations.city",
      foreignField: "_id",
      as: "destinations.city",
    },
  },
  {
    $addFields: {
      "destinations.continent": {
        $cond: [
          { $ne: ["$continent", null] },
          { $arrayElemAt: ["$destinations.continent", 0] },
          "$destinations.continent",
        ],
      },
      "destinations.country": {
        $cond: [
          { $ne: ["$country", null] },
          { $arrayElemAt: ["$destinations.country", 0] },
          "$destinations.country",
        ],
      },
      "destinations.region": {
        $cond: [
          { $ne: ["$region", null] },
          { $arrayElemAt: ["$destinations.region", 0] },
          "$destinations.region",
        ],
      },
      "destinations.province": {
        $cond: [
          { $ne: ["$province", null] },
          { $arrayElemAt: ["$destinations.province", 0] },
          "$destinations.province",
        ],
      },
      "destinations.city": {
        $cond: [
          { $ne: ["$city", null] },
          { $arrayElemAt: ["$destinations.city", 0] },
          "$destinations.city",
        ],
      },
    },
  },
];

module.exports.getSingleTour = (tour, language = "vi") => {
  // const slider = tour.itinerary
  //   .map((item) => item.images)
  //   .reduce((prev, cur) => {
  //     return [...prev, ...cur];
  //   }, []);

  const origin = {
    _id: tour._id,
    language: tour.language,
    slug: tour.slug,

    code: tour.code,
    name: tour.name,
    thumb: tour.thumb,
    banner: tour.banner,
    layout: tour.layout || [],
    price: tour.price,
    // slider: slider,
    hot: tour.hot,

    journey: tour.journey,
    // destinations: tour.destinations,
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

  const countries = tour.destinations.map((item) => {
    if (item.type === "country") {
      return item.name;
    }

    return item.country.name;
  });

  origin.countries = countries;
  origin.destinations = tour.destinations.map((dest) => ({
    continent: dest.continent
      ? { name: dest.continent.name, slug: dest.continent.slug }
      : null,
    country: dest.country
      ? { name: dest.country.name, slug: dest.country.slug }
      : null,
    region: dest.region
      ? { name: dest.region.name, slug: dest.region.slug }
      : null,
    province: dest.province
      ? { name: dest.province.name, slug: dest.province.slug }
      : null,
    city: dest.city ? { name: dest.city.name, slug: dest.city.slug } : null,
    type: dest.type,
    name: dest.name,
    slug: dest.slug,
  }));
  origin.destinations_text = tour.destinations
    .map((dest) => {
      if (language === "vi") return dest.name;
      const tid = dest.translation.findIndex(
        (item) => item.language === language
      );

      if (tid === -1) return dest.name;
      return dest.translation[tid].name;
    })
    .join(" - ");

  if (language === "vi") return origin;

  const tid = tour.translation.findIndex((item) => item.language === language);
  const t = tour.translation[tid];
  const trans_itinerary = t.itinerary.map((item, index) => ({
    ...item,
    images: tour.itinerary[index].images.map((imgItem, imgIndex) => ({
      ...imgItem,
      caption: item.images[imgIndex].caption,
    })),
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
    destinations: tour.destinations.map((dest) => ({
      continent: dest.continent
        ? {
            name: dest.continent.translation[0].name,
            slug: dest.continent.slug,
          }
        : null,
      country: dest.country
        ? { name: dest.country.translation[0].name, slug: dest.country.slug }
        : null,
      region: dest.region
        ? { name: dest.region.translation[0].name, slug: dest.region.slug }
        : null,
      province: dest.province
        ? { name: dest.province.translation[0].name, slug: dest.province.slug }
        : null,
      city: dest.city
        ? { name: dest.city.translation[0].name, slug: dest.city.slug }
        : null,
      type: dest.type,
      name: dest.translation[0].name,
      slug: dest.slug,
    })),
    itinerary: trans_itinerary,
  };
};

module.exports.getTours = async (language) => {
  let tours = [];

  const viQuery = [
    {
      $match: {
        thumb: { $ne: "" },
        banner: { $ne: "" },
        "itinerary.0": { $exists: true },
      },
    },
    {
      $project: {
        itinerary: 0,
        translation: 0,
        terms: 0,
        highlights: 0,
        price_policies: 0,
        rating: 0,
        __v: 0,
        url_endpoint: 0,
      },
    },
    ...this.destinationsLookup,
    {
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        code: { $first: "$code" },
        hot: { $first: "$hot" },
        duration: { $first: "$duration" },
        price: { $first: "$price" },
        layout: { $first: "$layout" },
        slug: { $first: "$slug" },
        itinerary: { $first: "$itinerary" },
        language: { $first: "$language" },
        thumb: { $first: "$thumb" },
        banner: { $first: "$banner" },
        translation: { $first: "$translation" },
        destinations: { $push: "$destinations" },
      },
    },
    {
      $project: {
        "destinations._id": 0,
        "destinations.continent._id": 0,
        "destinations.country._id": 0,
        "destinations.province._id": 0,
        "destinations.region._id": 0,
        "destinations.city._id": 0,
        "destinations.translation": 0,
        "destinations.continent.translation": 0,
        "destinations.country.translation": 0,
        "destinations.province.translation": 0,
        "destinations.region.translation": 0,
        "destinations.city.translation": 0,
      },
    },
  ];

  const foreignQuery = [
    {
      $match: {
        thumb: { $ne: "" },
        banner: { $ne: "" },
        translation: {
          $elemMatch: {
            language: language,
          },
        },
      },
    },
    {
      $project: {
        name: 0,
        description: 0,
        terms: 0,
        price_policies: 0,
        itinerary: 0,
        __v: 0,
        updatedAt: 0,
        createdAt: 0,
      },
    },
    ...this.destinationsLookup,
    {
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        hot: { $first: "$hot" },
        code: { $first: "$code" },
        duration: { $first: "$duration" },
        layout: { $first: "$layout" },
        price: { $first: "$price" },
        slug: { $first: "$slug" },
        itinerary: { $first: "$itinerary" },
        language: { $first: "$language" },
        thumb: { $first: "$thumb" },
        banner: { $first: "$banner" },
        translation: { $first: "$translation" },
        destinations: { $push: "$destinations" },
      },
    },
  ];

  try {
    if (language === "vi") {
      tours = await Tour.aggregate(viQuery);
      tours = tours.map((tour) => ({
        _id: tour._id,
        language: tour.language,
        slug: tour.slug,
        code: tour.code,
        hot: tour.hot,
        name: tour.name,
        price: tour.price,
        duration: tour.duration,
        journey: tour.journey,
        layout: tour.layout,
        destinations: tour.destinations,
        departure_dates: tour.departure_dates,
        thumb: tour.thumb,
        banner: tour.banner,
        is_vn_tour: tour.destinations.every(
          (dest) => dest.country?.slug === "viet-nam"
        ),
        is_eu_tour: tour.destinations.some(
          (dest) => dest.continent?.slug === "chau-au"
        ),
      }));
    }

    if (language !== "vi") {
      tours = await Tour.aggregate(foreignQuery);

      tours = tours.map((tour) => ({
        _id: tour._id,
        language: tour.translation[0].language,
        slug: tour.slug,
        code: tour.code,
        hot: tour.hot,
        name: tour.translation[0].name,
        price: tour.price,
        duration: tour.duration,
        journey: tour.translation[0].journey,
        layout: tour.layout,
        destinations: tour.destinations.map((dest) => ({
          continent: dest.continent
            ? {
                name: dest.continent.translation[0].name,
                slug: dest.continent.slug,
              }
            : null,
          country: dest.country
            ? {
                name: dest.country.translation[0].name,
                slug: dest.country.slug,
              }
            : null,
          region: dest.region
            ? { name: dest.region.translation[0].name, slug: dest.region.slug }
            : null,
          province: dest.province
            ? {
                name: dest.province.translation[0].name,
                slug: dest.province.slug,
              }
            : null,
          city: dest.city
            ? { name: dest.city.translation[0].name, slug: dest.city.slug }
            : null,
          name: dest.translation[0].name,
          slug: dest.slug,
          type: dest.type,
        })),
        departure_dates: tour.departure_dates,
        thumb: tour.thumb,
        banner: tour.banner,
        is_vn_tour: tour.destinations.every(
          (dest) => dest.country?.slug === "viet-nam"
        ),
        is_eu_tour: tour.destinations.some(
          (dest) => dest.continent?.slug === "chau-au"
        ),
      }));
    }

    return [null, tours];
  } catch (error) {
    return [error, null];
  }
};

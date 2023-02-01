const Tour = require("../../models/tour");

module.exports.getSingleTour = (tour, language = "vi") => {
  const slider = tour.itinerary
    .map((item) => item.images)
    .reduce((prev, cur) => {
      return [...prev, ...cur];
    }, []);

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
    ...item._doc,
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

module.exports.getTours = async (language) => {
  let tours = [];

  try {
    if (language === "vi") {
      tours = await Tour.find(
        {
          thumb: { $ne: "" },
          banner: { $ne: "" },
          "itinerary.0": { $exists: true },
        },
        {
          itinerary: 0,
          translation: 0,
          terms: 0,
          highlights: 0,
          price_policies: 0,
        }
      ).populate("destinations");
    }

    if (language !== "vi") {
      tours = await Tour.find(
        {
          thumb: { $ne: "" },
          banner: { $ne: "" },
          "itinerary.0": { $exists: true },
          translation: {
            $elemMatch: {
              language: language,
              "translation.itinerary.0": { $exists: true },
            },
          },
        },
        {
          _id: 1,
          language: 1,
          slug: 1,
          code: 1,
          hot: 1,
          price: 1,
          duration: 1,
          layout: 1,
          destinations: 1,
          departure_dates: 1,
          thumb: 1,
          banner: 1,
          updatedAt: 1,
          createdAt: 1,
          translation: {
            $elemMatch: {
              language: language,
            },
          },
        }
      ).populate("destinations");

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
        destinations: tour.destinations,
        departure_dates: tour.departure_dates,

        itinerary: tour.translation[0].itinerary,

        thumb: tour.thumb,
        banner: tour.banner,

        updatedAt: tour.updatedAt,
        createdAt: tour.createdAt,
      }));
    }

    return [null, tours];
  } catch (error) {
    return [error, null];
  }
};

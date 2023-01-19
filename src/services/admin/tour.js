const Tour = require("../../models/tour");

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

module.exports.getTours = async () => {
  try {
    const tours = await Tour.find({}).populate("destinations");
    const results = tours.map((tour) => {
      let itinerary_language_versions = [];
      if (tour.itinerary.length > 0) {
        itinerary_language_versions.push("vi");
      }

      tour.translation.forEach((item) => {
        if (item.itinerary && item.itinerary.length > 0) {
          itinerary_language_versions.push(item.language);
        }
      });

      return {
        _id: tour._id,
        code: tour.code,
        name: tour.name,
        url_endpoint: tour.url_endpoint,
        price: tour.price,
        depature_dates: tour.depature_dates,
        destinations: tour.destinations,

        duration: tour.duration,
        layout: tour.layout,
        hot: tour.hot,
        journey: tour.journey,

        thumb: tour.thumb,
        banner: tour.banner,

        countries: Array.from(
          new Set(tour.destinations.map((item) => item.country))
        ),
        provinces: Array.from(
          new Set(tour.destinations.map((item) => item.province))
        ),

        language_versions: tour.translation
          .map((item) => item.language)
          .concat(["vi"]),

        itinerary_language_versions,

        missingItineraryImages: tour.itinerary.every(
          (item) => !item.images || item.images.length === 0
        ),

        is_vn_tour: tour.destinations.every(
          (dest) => dest.country === "vietnam"
        ),
        is_eu_tour: tour.destinations.some(
          (dest) => dest.continent === "europe"
        ),
      };
    });

    return [null, results];
  } catch (error) {
    return [error, null];
  }
};

module.exports.getSingleTour = (tour, language) => {
  const originalTour = {
    language: tour.language,
    _id: tour._id,
    code: tour.code,
    is_special: tour.is_special,
    name: tour.name,

    category: tour.category,

    countries: tour.countries,
    journey: tour.journey,
    description: tour.description,
    highlights: tour.highlights,

    price: tour.price,
    duration: tour.duration,
    departureDates: tour.departureDates,

    price_policies: tour.price_policies,
    terms: tour.terms,

    thumb: tour.thumb,
    thumb_original: tour.thumb_original,
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

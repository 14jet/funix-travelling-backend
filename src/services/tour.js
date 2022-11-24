module.exports.getTourBasicData = (tour, lang) => {
  const tour_vi = {
    _id: tour._id,
    name: tour.name,
    code: tour.code,
    journey: tour.journey,
    countries: tour.countries,
    description: tour.description,
    currentPrice: tour.currentPrice,
    oldPrice: tour.oldPrice,
    days: tour.days,
    nights: tour.nights,
    thumb: tour.thumb,
  };

  if (lang === "vi" || !tour.translation) {
    return tour_vi;
  }

  if (lang !== "vi") {
    const trans = tour.translation.find((item) => item.language === lang);
    if (!trans) {
      return tour_vi;
    }

    return {
      ...tour_vi,
      name: trans.name,
      journey: trans.journey,
      countries: trans.countries,
      description: trans.description,
    };
  }
};

module.exports.getFullTour = (tour, lang) => {
  const tour_vi = {
    _id: tour._id,
    name: tour.name,
    code: tour.code,
    category: tour.category,
    journey: tour.journey,
    countries: tour.countries,
    description: tour.description,
    currentPrice: tour.currentPrice,
    oldPrice: tour.oldPrice,
    days: tour.days,
    nights: tour.nights,
    thumb: tour.thumb,
    slider: tour.slider,
    departureDates: tour.departureDates,
    itinerary: tour.itinerary,
    priceIncludes: tour.priceIncludes,
    priceExcludes: tour.priceExcludes,
    highlights: tour.highlights,
    cancellationPolicy: tour.cancellationPolicy,
  };

  if (lang === "vi" || !tour.translation) {
    return tour_vi;
  }

  if (lang !== "vi") {
    const trans = tour.translation.find((item) => item.language === lang);
    if (!trans) {
      return tour_vi;
    }

    return {
      ...tour_vi,
      name: trans.name,
      code: trans.code,
      journey: trans.journey,
      countries: trans.countries,
      description: trans.description,
      itinerary: trans.itinerary,
      priceIncludes: trans.priceIncludes,
      priceExcludes: trans.priceExcludes,
      highlights: trans.highlights,
      cancellationPolicy: trans.cancellationPolicy,
    };
  }
};

module.exports.getToursBasicData = (tours, lang) => {
  return tours.map((item) => this.getTourBasicData(item, lang));
};

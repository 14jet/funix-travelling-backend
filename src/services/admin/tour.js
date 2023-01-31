const Tour = require("../../models/tour");
const TourCode = require("../../models/tourcode");
const {
  uploadFromMemoryToGC: uploadImg,
} = require("../../helpers/firebase-admin");
const StringHandler = require("../../helpers/stringHandler");
const { v4: uuid } = require("uuid");

module.exports.getSingleTour = (tour, language) => {
  const viTour = {
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

  if (language === "vi") return viTour;

  const tid = tour.translation.findIndex((item) => item.language === language);

  if (tid === -1) return null;

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
  return { ...viTour, ...rest, itinerary: itinerary };
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

module.exports.createTourCode = async (code) => {
  // code: string có dạng 'tet', 'gs',... (không có số)
  // return code có dạng TET-01, GS-01, không bị trùng, số ở sau tăng dần

  const tourCode = await TourCode.findOne({ code: code });
  if (tourCode) {
    tourCode.number = tourCode.number + 1;
    await tourCode.save();

    if (tourCode.number < 10) return `${code}-0${tourCode.number}`;
    return code + "-" + tourCode.number;
  } else {
    await TourCode.create({ code: code, number: 1 });
    return code + "-01";
  }
};

module.exports.uploadTourImg = async (file, fileName) => {
  const buffer = file.buffer;
  const originalname = file.originalname;
  const extension = StringHandler.getFileExtension(originalname);
  const uploadName =
    StringHandler.urlEndpoinConverter(fileName) + "-" + uuid() + extension;

  const url = await uploadImg(`tour/${uploadName}`, buffer);
  return url;
};

module.exports.prepareItineraryIMGs = async (files) => {
  // input: files: [ file ]
  // file: {buffer, originalname,...}
  // originalname có dạng: imgId-joyadivider-caption.jpguploadImg
  // output: [ { imgId, url } ]

  const imgItems = files.map((file) => {
    const [imgId, fileName] = file.originalname.split("-joyadivider-");
    const nameWithoutExtension = fileName.slice(0, fileName.lastIndexOf(".")); // bỏ đuôi,... .jpg đi

    return {
      imgId,
      fileName: nameWithoutExtension,
      file,
    };
  });

  const urls = await Promise.all(
    imgItems.map((item) => this.uploadTourImg(item.file, item.fileName))
  );

  return imgItems.map((item, index) => ({
    imgId: item.imgId,
    url: urls[index],
  }));
};

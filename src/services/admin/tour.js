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
    slug: tour.slug,

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
    // const tours = await Tour.find({}).populate("destinations");
    const tours = await Tour.aggregate([
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
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          code: { $first: "$code" },
          slug: { $first: "$slug" },
          itinerary: { $first: "$itinerary" },
          language: { $first: "$language" },
          thumb: { $first: "$thumb" },
          banner: { $first: "$banner" },
          translation: { $first: "$translation" },
          destinations: { $push: "$destinations" },
        },
      },
    ]);

    const results = tours.map((tour) => {
      return {
        _id: tour._id,
        code: tour.code,
        name: tour.name,
        slug: tour.slug,
        price: tour.price,
        depature_dates: tour.depature_dates,
        destinations: tour.destinations,

        duration: tour.duration,
        layout: tour.layout,
        hot: tour.hot,
        journey: tour.journey,

        thumb: tour.thumb,
        banner: tour.banner,

        missingItineraryImages: tour.itinerary.every(
          (item) => !item.images || item.images.length === 0
        ),

        is_vn_tour: tour.destinations.every(
          (dest) => dest.country?.slug === "viet-nam"
        ),
        is_eu_tour: tour.destinations.some(
          (dest) => dest.continent?.slug === "chau-au"
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
  const uploadName = StringHandler.slugify(fileName) + "-" + uuid() + extension;

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

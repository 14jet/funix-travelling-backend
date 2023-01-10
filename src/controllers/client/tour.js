const mongoose = require("mongoose");
const Tour = require("../../models/tour");
const Place = require("../../models/place");
const createError = require("../../helpers/errorCreator");
const client_tourServices = require("../../services/client/tour");
const googleAuthorize = require("../../helpers/googleSheet");
const authorize = require("../../helpers/googleSheet");
const GoogleSheet = require("../../models/googlesheet");
const appendRow = require("../../helpers/googleSheet/appendRow");
const { format } = require("date-fns");

const places = [
  {
    continent: "asia",
    country: "vietnam",
    province: "an-giang",
    region: "southern",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "ba-ria-vung-tau",
    region: "southern",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "bac-lieu",
    region: "southern",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "bac-kan",
    region: "northern",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "bac-giang",
    region: "northern",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "bac-ninh",
    region: "northern",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "ben-tre",
    region: "southern",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "binh-duong",
    region: "southern",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "binh-dinh",
    region: "central",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "binh-phuoc",
    region: "southern",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "binh-thuan",
    region: "central",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "ca-mau",
    region: "southern",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "cao-bang",
    region: "northern",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "can-tho",
    region: "southern",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "da-nang",
    region: "central",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "dak-lak",
    region: "central",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "dak-nong",
    region: "northern",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "dien-bien",
    region: "central",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "dong-nai",
    region: "southern",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "dong-thap",
    region: "southern",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "gia-lai",
    region: "central",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "ha-giang",
    region: "northern",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "ha-nam",
    region: "northern",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "ha-noi",
    region: "northern",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "ha-tay",
    region: "northern",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "ha-tinh",
    region: "central",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "hai-duong",
    region: "northern",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "hai-phong",
    region: "northern",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "hoa-binh",
    region: "northern",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "ho-chi-minh",
    region: "southern",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "hau-giang",
    region: "southern",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "hung-yen",
    region: "northern",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "khanh-hoa",
    region: "central",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "kien-giang",
    region: "southern",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "kon-tum",
    region: "central",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "lai-chau",
    region: "northern",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "lao-cai",
    region: "northern",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "lang-son",
    region: "northern",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "lam-dong",
    region: "central",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "long-an",
    region: "southern",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "nam-dinh",
    region: "northern",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "nghe-an",
    region: "central",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "ninh-binh",
    region: "northern",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "ninh-thuan",
    region: "central",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "phu-tho",
    region: "northern",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "phu-yen",
    region: "central",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "quang-binh",
    region: "central",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "quang-nam",
    region: "central",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "quang-ngai",
    region: "central",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "quang-ninh",
    region: "northern",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "quang-tri",
    region: "central",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "soc-trang",
    region: "southern",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "son-la",
    region: "northern",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "tay-ninh",
    region: "southern",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "thai-binh",
    region: "northern",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "thai-nguyen",
    region: "northern",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "thanh-hoa",
    region: "central",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "hue",
    region: "central",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "tien-giang",
    region: "southern",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "tra-vinh",
    region: "southern",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "tuyen-quang",
    region: "northern",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "vinh-long",
    region: "southern",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "vinh-phuc",
    region: "northern",
  },
  {
    continent: "asia",
    country: "vietnam",
    province: "yen-bai",
    region: "northern",
  },
  {
    continent: "europe",
    country: "russia",
    region: "eastern",
  },
  {
    continent: "europe",
    country: "germany",
    region: "western",
  },
  {
    continent: "europe",
    country: "united-kingdom",
    region: "northern",
  },
  {
    continent: "europe",
    country: "france",
    region: "western",
  },
  {
    continent: "europe",
    country: "italy",
    region: "southern",
  },
  {
    continent: "europe",
    country: "spain",
    region: "southern",
  },
  {
    continent: "europe",
    country: "ukraine",
    region: "eastern",
  },
  {
    continent: "europe",
    country: "poland",
    region: "eastern",
  },
  {
    continent: "europe",
    country: "romania",
    region: "eastern",
  },
  {
    continent: "europe",
    country: "netherlands",
    region: "western",
  },
  {
    continent: "europe",
    country: "belgium",
    region: "western",
  },
  {
    continent: "europe",
    country: "czechia",
    region: "eastern",
  },
  {
    continent: "europe",
    country: "greece",
    region: "southern",
  },
  {
    continent: "europe",
    country: "portugal",
    region: "southern",
  },
  {
    continent: "europe",
    country: "sweden",
    region: "northern",
  },
  {
    continent: "europe",
    country: "hungary",
    region: "eastern",
  },
  {
    continent: "europe",
    country: "belarus",
    region: "eastern",
  },
  {
    continent: "europe",
    country: "austria",
    region: "western",
  },
  {
    continent: "europe",
    country: "serbia",
    region: "southern",
  },
  {
    continent: "europe",
    country: "switzerland",
    region: "western",
  },
  {
    continent: "europe",
    country: "bulgaria",
    region: "eastern",
  },
  {
    continent: "europe",
    country: "denmark",
    region: "northern",
  },
  {
    continent: "europe",
    country: "finland",
    region: "northern",
  },
  {
    continent: "europe",
    country: "slovakia",
    region: "eastern",
  },
  {
    continent: "europe",
    country: "norway",
    region: "northern",
  },
  {
    continent: "europe",
    country: "ireland",
    region: "northern",
  },
  {
    continent: "europe",
    country: "croatia",
    region: "southern",
  },
  {
    continent: "europe",
    country: "moldova",
    region: "eastern",
  },
  {
    continent: "europe",
    country: "bosnia-herzegovina",
    region: "southern",
  },
  {
    continent: "europe",
    country: "albania",
    region: "southern",
  },
  {
    continent: "europe",
    country: "lithuania",
    region: "northern",
  },
  {
    continent: "europe",
    country: "north-macedonia",
    region: "southern",
  },
  {
    continent: "europe",
    country: "slovenia",
    region: "southern",
  },
  {
    continent: "europe",
    country: "latvia",
    region: "northern",
  },
  {
    continent: "europe",
    country: "kosovo",
    region: "southern",
  },
  {
    continent: "europe",
    country: "estonia",
    region: "northern",
  },
  {
    continent: "europe",
    country: "montenegro",
    region: "southern",
  },
  {
    continent: "europe",
    country: "luxembourg",
    region: "western",
  },
  {
    continent: "europe",
    country: "malta",
    region: "southern",
  },
  {
    continent: "europe",
    country: "iceland",
    region: "northern",
  },
  {
    continent: "europe",
    country: "andorra",
    region: "southern",
  },
  {
    continent: "europe",
    country: "monaco",
    region: "western",
  },
  {
    continent: "europe",
    country: "liechtenstein",
    region: "western",
  },
  {
    continent: "europe",
    country: "san-marino",
    region: "southern",
  },
  {
    continent: "europe",
    country: "holy-see",
    region: "southern",
  },
];

module.exports.getTours = async (req, res, next) => {
  try {
    let {
      lang,
      page,
      page_size,
      cat,
      cat_not,
      sort,
      search,
      slider,
      special,
      banner,
    } = req.query;
    if (!lang) {
      lang = "vi";
    }

    if (!page) {
      page = 1;
    }

    if (!page_size) {
      page_size = 6;
    }

    const results = await Tour.aggregate(
      client_tourServices.aggCreator({
        page,
        page_size,
        cat,
        cat_not,
        sort,
        search,
        lang,
        slider,
        special,
        banner,
      })
    );

    const tours = results[0]?.tours || [];
    const total_count = results[0]?.count[0]?.total_count || 0;

    // metadata
    const page_count = Math.ceil(total_count / page_size);
    const remain_count = total_count - (page_size * (page - 1) + tours.length);
    const remain_page_count = page_count - page;
    const has_more = page < page_count;

    const metadata = {
      page,
      page_size,
      page_count,
      remain_page_count,
      total_count,
      remain_count,
      has_more,
      lang,
      links: [],
    };

    return res.status(200).json({
      data: client_tourServices.getTours(tours, lang),
      metadata,
    });
  } catch (error) {
    next(createError(error, 500));
  }
};

module.exports.getSingleTour = async (req, res, next) => {
  try {
    const { tourId } = req.params;
    let { lang } = req.query;
    if (!lang) {
      lang = "vi";
    }

    const tour = await Tour.findOne({ _id: tourId });

    if (!tour) {
      return next(
        createError(new Error(""), 404, {
          en: "Tour Not Found",
          vi: "Tour không tồn tại",
        })
      );
    }

    const related_tours = await Tour.find({
      _id: { $ne: tour._id },
      category: { $in: tour.category },
    }).limit(6);

    return res.status(200).json({
      data: {
        item: client_tourServices.getSingleTour(tour, lang),
        relatedItems: client_tourServices.getTours(related_tours, lang),
      },
    });
  } catch (error) {
    next(createError(error, 500));
  }
};

module.exports.bookTour = async (req, res, next) => {
  try {
    //
    const {
      tourId,
      firstname,
      surname,
      email,
      phone,
      gender,
      address,
      adult,
      children,
      departureDate,
    } = req.body;

    const tour = await Tour.findOne({ _id: tourId });
    const tourName = tour?.name;
    const tourCode = tour?.code;
    const tourCategory = tour?.category?.includes("europe")
      ? "Tour châu Âu"
      : "Tour trong nước";
    const tourPrice = tour?.price;

    const spreadsheetId = (await GoogleSheet.findOne({ name: "booking" }))
      .spreadsheetId;

    const auth = await authorize();
    const range = "Sheet1!B2:Z2";
    const d = new Date();
    const values = [
      format(d, "hh:mm"),
      format(d, "dd/MM/yyyy"),
      firstname,
      surname,
      email,
      phone,
      gender,
      address,
      adult,
      children,
      tourId,
      tourName,
      tourCode,
      tourCategory,
      tourPrice.toLocaleString(),
      format(new Date(departureDate), "dd/MM/yyyy"),
    ];

    await appendRow(auth, spreadsheetId, range, values);

    return res.status(200).json({
      message: {
        en: "Success",
        vi: "Thành công",
      },
      code: 200,
    });
  } catch (error) {
    next(createError(error, 500));
  }
};

module.exports.callMeBack = async (req, res, next) => {
  try {
    const { firstname, surname, gender, phone, tourId } = req.body;

    const tour = await Tour.findOne({ _id: tourId });
    const tourName = tour?.name;
    const tourCode = tour?.code;
    const tourCategory = tour?.category?.includes("europe")
      ? "Tour châu Âu"
      : "Tour trong nước";
    const tourPrice = tour?.price;

    const auth = await authorize();
    const range = "Sheet1!B2:L2";
    const d = new Date();
    const values = [
      format(d, "hh:mm"),
      format(d, "dd/MM/yyyy"),
      firstname,
      surname,
      gender,
      phone,
      tourId,
      tourName,
      tourCode,
      tourCategory,
      tourPrice,
    ];

    const spreadsheetId = (await GoogleSheet.findOne({ name: "call-me-back" }))
      .spreadsheetId;

    await appendRow(auth, spreadsheetId, range, values);

    return res.status(200).json({
      message: {
        en: "Success",
        vi: "Thành công",
      },
      code: 200,
    });
  } catch (error) {
    next(createError(error, 500));
  }
};

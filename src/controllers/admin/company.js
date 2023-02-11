const CompanyInfo = require("../../models/companyInfo");
const createError = require("../../helpers/errorCreator");

module.exports.getCompanyInfo = async (req, res, next) => {
  try {
    let companyInfo = await CompanyInfo.findOne();
    if (!companyInfo) {
      companyInfo = await CompanyInfo.create({
        language: "vi",
        name: "",
        address: "",
        phone: "",
        hotline: "",
        email: "",
        website: "",
        license_name: "",
        license_agency: "",
        license_number: "",
        license_date: "",
        translation: [
          {
            language: "en",
            name: "",
            address: "",
            license_name: "",
            license_agency: "",
          },
        ],
      });
    }
    return res.status(200).json({
      data: companyInfo,
    });
  } catch (error) {
    return next(createError(error, 500));
  }
};

module.exports.updateCompanyInfo = async (req, res, next) => {
  try {
    const companyInfo = req.body;
    await CompanyInfo.remove({});

    const updatedCompanyInfo = await CompanyInfo.create(companyInfo);

    return res.status(200).json({
      data: updatedCompanyInfo,
    });
  } catch (error) {
    return next(createError(error, 500));
  }
};

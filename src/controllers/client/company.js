const mongoose = require("mongoose");
const createError = require("../../helpers/errorCreator");
const CompanyInfo = require("../../models/companyInfo");

module.exports.getCompanyInfo = async (req, res, next) => {
  try {
    let language = req.query.lang || "vi";

    const companyInfo = await CompanyInfo.findOne();
    if (!companyInfo) {
      throw new Error("Not found company info item");
    }

    let data;
    if (language === "vi") {
      data = {
        name: companyInfo.name,
        address: companyInfo.address,
        phone: companyInfo.phone,
        hotline: companyInfo.hotline,
        email: companyInfo.email,
        website: companyInfo.website,
        license_name: companyInfo.license_name,
        license_agency: companyInfo.license_agency,
        license_number: companyInfo.license_number,
        license_date: companyInfo.license_date,
      };
    } else {
      data = {
        name: companyInfo.translation[0].name,
        address: companyInfo.translation[0].address,
        phone: companyInfo.translation[0].phone,
        hotline: companyInfo.translation[0].hotline,
        email: companyInfo.translation[0].email,
        website: companyInfo.translation[0].website,
        license_name: companyInfo.translation[0].license_name,
        license_agency: companyInfo.translation[0].license_agency,
        license_number: companyInfo.translation[0].license_number,
        license_date: companyInfo.translation[0].license_date,
      };
    }

    return res.status(200).json({
      data: data,
    });
  } catch (error) {
    return next(createError(error, 500));
  }
};

const createError = require("../../helpers/errorCreator");
const Tour = require("../../models/tour");

const createTourvalidator = async (req, res, next) => {
  try {
    // name
    const name = req.body.name;
    const url_endpoint = StringHandler.urlEndpoinConverter(name);
    const tour = await Tour.findOne({ url_endpoint: url_endpoint });
    if (tour)
      return next(
        createError(new Error(""), 400, {
          en: "The name already exists. Please choose another one",
          vi: "Tên tour đã tồn tại. Vui lòng chọn 1 tên khác",
        })
      );
  } catch (error) {
    return next(createError(error, 500));
  }
};

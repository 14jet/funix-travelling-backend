require("dotenv").config();
// cấu hình lại vị trí chứa file config
process.env["NODE_CONFIG_DIR"] = __dirname + "/config/";

const app = require("express")();

// middlewares
app.use(require("./middlewares/cors.middleware"));
app.use(require("body-parser").json());

// admin routes

// client routes
app.use("/api/client/tour", require("./routes/client/tour.route"));

// 404 handler
app.all("*", require("./middlewares/notFound.middleware"));

// error handler
app.use(require("./middlewares/errorHandler.middleware"));

// connect to database
require("./helpers/connectDB")();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `Server is running on port ${PORT} in ${process.env.NODE_ENV} environment`
  );
});

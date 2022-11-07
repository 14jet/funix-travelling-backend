require("dotenv").config();
// cấu hình lại vị trí chứa file config
process.env["NODE_CONFIG_DIR"] = __dirname + "/config/";

const app = require("express")();

// middlewares
app.set("trust proxy", 1);
app.use(require("./middlewares/cors.middleware"));
app.use(require("body-parser").json());
app.use("/images", require("./middlewares/staticFiles.middleware"));

// routes
app.use("/api/user", require("./routes/user.route"));
app.use("/api/tour", require("./routes/tour.route"));
app.use("/api/article", require("./routes/article.route"));
app.use("/api/file", require("./routes/file.route"));

// 404 handler
app.all("*", require("./middlewares/notFound.middleware"));

// error handler
app.use(require("./middlewares/errorHandler.middleware"));

console.log(process.env.NODE_ENV);
// connect to database
require("./helpers/connectDB")();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `Server is running on port ${PORT} in ${process.env.NODE_ENV} environment`
  );
});

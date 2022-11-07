require("dotenv").config();
// cấu hình lại vị trí chứa file config
process.env["NODE_CONFIG_DIR"] = __dirname + "/config/";

const app = require("express")();

// middlewares
app.use(require("./middlewares/cors"));
app.set("trust proxy", 1);
app.use(require("body-parser").json());
app.use("/images", require("./middlewares/staticFile"));

// routes
app.use("/api/user", require("./routes/user"));
app.use("/api/tour", require("./routes/tour"));
app.use("/api/article", require("./routes/article"));
app.use("/api/file", require("./routes/file"));

// 404 handler
app.all("*", require("./middlewares/notFound"));

// error handler
app.use(require("./middlewares/erroHandler"));

// connect to database
require("./helpers/connectDB")();

app.listen(process.env.PORT || 5000, () => {
  console.log(
    `Server is running on port ${PORT} in ${process.env.NODE_ENV} environment`
  );
});

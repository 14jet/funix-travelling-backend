require("dotenv").config();
// cấu hình lại vị trí chứa file config
process.env["NODE_CONFIG_DIR"] = __dirname + "/config/";

const app = require("express")();

// middlewares
app.use(require("./middlewares/cors"));
app.set("trust proxy", 1);
app.use(require("helmet")());
app.use(require("body-parser").json({ limit: "50mb" }));
app.use("/images", require("./middlewares/staticFile"));

// routes
app.use("/api/user", require("./routes/client/user"));
app.use("/api/tour", require("./routes/client/tour"));
app.use("/api/article", require("./routes/client/article"));
app.use("/api/visa", require("./routes/client/visa"));
app.use("/api/layout", require("./routes/client/layout"));

// admin
app.use("/api/admin/categories", require("./routes/admin/category"));
app.use("/api/admin/article", require("./routes/admin/article"));
app.use("/api/admin/tour", require("./routes/admin/tour"));
app.use("/api/admin/layout", require("./routes/admin/layout"));

app.all("*", require("./middlewares/notFound"));
app.use(require("./middlewares/errorHandler"));

// connect to database
require("./helpers/connectDB")();

app.listen(process.env.PORT || 5000, () => {
  console.log(
    `Server is running on port ${process.env.PORT} in ${process.env.NODE_ENV} environment`
  );
});

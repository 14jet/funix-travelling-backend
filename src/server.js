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
app.use("/user", require("./routes/client/user"));
app.use("/tour", require("./routes/client/tour"));
app.use("/article", require("./routes/client/article"));
app.use("/visa", require("./routes/client/visa"));
app.use("/layout", require("./routes/client/layout"));
app.use("/term", require("./routes/client/term"));
app.use("/about", require("./routes/client/about"));

// admin
app.use("/admin/categories", require("./routes/admin/category"));
app.use("/admin/article", require("./routes/admin/article"));
app.use("/admin/tour", require("./routes/admin/tour"));
app.use("/admin/term", require("./routes/admin/term"));
app.use("/admin/layout", require("./routes/admin/layout"));
app.use("/admin/about", require("./routes/admin/about"));

app.all("*", require("./middlewares/notFound"));
app.use(require("./middlewares/errorHandler"));

// connect to database
require("./helpers/connectDB")();
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(
    `Server is running on port ${port} in ${process.env.NODE_ENV} environment`
  );
});

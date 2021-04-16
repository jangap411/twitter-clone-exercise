const http = require("http");
const express = require("express");
const app = express();
const port = 8090;
const morgan = require("morgan");
const routes = require("./routes/routes");

app.use(morgan("dev"));
app.set("view engine", "ejs");
app.use(express.static("static"));
app.use("/css", express.static(__dirname + "static/css"));
app.use("/images", express.static(__dirname + "static/images"));
app.use("/js", express.static(__dirname + "static/js"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(routes);

app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  console.log("\n---- errror status middleware1 ----\n");
  console.log("\nThe ERR:", err, "\n");
  next(err);
  // res.end();
});

app.use((err, req, res, next) => {
  res.locals.error = err;
  console.log("\n---- errror status middleware2 ----\n");
  const status = err.status || 500;
  res.status(status);
  console.log("\nmiddleware2 Error", err, "\n");
  res.render("error");
});

const server = http.createServer(app);

server.listen(port, () =>
  console.log(`\nListening on http://localhost:${port}\n`)
);

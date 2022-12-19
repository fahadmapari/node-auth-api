const express = require("express");
const morgan = require("morgan");
const createError = require("http-errors");
require("dotenv").config();

const app = express();

const AuthRoute = require("./routes/Auth.route");

app.use(express.json());

app.get("/", async (req, res, next) => {
  res.send("hi");
});

app.use("/auth", AuthRoute);

app.use(async (req, res, next) => {
  // const error = new Error("Not found");
  // error.status = 404;
  next(createError.NotFound("This route does not exist!"));
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    status: err.status || 500,
    message: err.message,
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running at port: " + PORT);
});

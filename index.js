const express = require("express");
const morgan = require("morgan");
const createError = require("http-errors");
require("dotenv").config();

const app = express();

app.use(express.json());

app.get("/", async (req, res, next) => {});

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

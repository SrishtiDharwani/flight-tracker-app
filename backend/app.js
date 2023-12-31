const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const HttpError = require("./models/http-error");
require("dotenv").config()
const cors=require("cors")

const userRoutes = require("./routes/user-routes");

const app = express(bodyParser);

app.use(cors())
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin,X-Requested-With,Content-Type,Accept,Authorization"
    );
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE");
    next();
  });

app.use("/api/user", userRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

mongoose
  .connect(process.env.MONGO
  )
  .then(() => {
    app.listen(5000);
    console.log("app running");
  })
  .catch((err) => {
    console.log(err);
  });

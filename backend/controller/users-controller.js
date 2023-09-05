const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const HttpError = require("../models/http-error");
const User = require("../models/User");
require("dotenv").config();

const signup = async (req, res, next) => {
  const { name,email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Signing up failed! Please try again", 500);
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError("User already exists, please login instead.");
    return next(error);
  }

  let hashedPw;

  try {
    hashedPw = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError("Could not create user! Please try again", 500);
    return next(error);
  }

  const createdUser = new User({
    name,email,
    password: hashedPw,
  });
  try {
    createdUser.save();
  } catch (err) {
    const error = new HttpError("Signing up failed! Please try again!", 500);
    return next(error);
  }

  //jwt
  let token;
  try {
    token = jwt.sign(
      {
        userId: createdUser.id,
        email: createdUser.email,
      },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError("Signing up failed! Please try again", 500);
    return next(error);
  }

  res.status(201).json({ userId: createdUser.id,name:createdUser.name,email: createdUser.email, token });
};

const signin = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Logging in failed! Please try again", 500);
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      "Invalid credentials, could not log you in",
      401
    );
    return next(error);
  }

  let isValidPw = false;
  try {
    isValidPw = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError(
      "Could not log you in, please check your credentials and try again!",
      500
    );
    return next(error);
  }

  if (!isValidPw) {
    const error = new HttpError(
      "Could not log you in, please check your credentials and try again!",
      403
    );
    return next(error);
  }

  let token;
  try {
    token = jwt.sign({ userId: existingUser.id,email: existingUser.email }, process.env.JWT_KEY, {
      expiresIn: "1h",
    });
  } catch (err) {
    const error = new HttpError("Logging in failed, please try again!", 500);
    return next(error);
  }

  res.json({
    userId: existingUser.id,
    name: existingUser.name,
    email: existingUser.email,
    token: token,
  });
};

exports.signup = signup;
exports.signin = signin;

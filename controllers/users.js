const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const HttpError = require("../models/http-error");

export const signUp = async (req, res, next) => {
  let user = req.body;
  let existingUser;

  try {
    existingUser = await User.findOne({ email: user.email });
  } catch (error) {
    const err = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    return next(err);
  }
  if (existingUser) {
    const err = new HttpError(
      "User exists already, please login instead.",
      422
    );
    return next(err);
  }

  let hashedPassword;

  try {
    hashedPassword = bcrypt.hash(user.password, 12);
  } catch (error) {
    const err = new HttpError("could not create user, please try again", 500);
    return next(err);
  }

  const createdUser = new User({
    name: user.name,
    email: user.email,
    password: hashedPassword,
  });

  try {
    await createdUser.save();
  } catch (error) {
    const err = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    return next(err);
  }

  let token;

  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      "secret_code_dont_share",
      { expiresIn: "2h" }
    );
  } catch (error) {
    const err = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    return next(err);
  }

  res
    .json({
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
      token,
    })
    .status(201);
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: user.email });
  } catch (error) {
    const err = new HttpError(
      "Logging in failed, please try again later.",
      500
    );
    return next(err);
  }

  if (!existingUser) {
    const err = new HttpError(
      "Invalid credentials, could not log you in.",
      403
    );
    return next(err);
  }

  let isPasswordValid = false;

  try {
    isPasswordValid = await bcrypt.compare(password, existingUser.password);
  } catch (error) {
    const err = new HttpError(
      "Could not log you in, please check your credentials",
      500
    );
    return next(err);
  }

  if (!isPasswordValid) {
    const err = new HttpError("Invalid credential, Could'nt log you in", 401);
    return next(err);
  }

  let token;

  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      "secret_code_dont_share",
      { expiresIn: "2h" }
    );
  } catch (error) {
    const err = new HttpError(
      "Logging in failed, please try again later.",
      500
    );
    return next(err);
  }

  res.json({ userId: existingUser.id, email: existingUser, token }).status(200);
};

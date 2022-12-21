const router = require("express").Router();
const createError = require("http-errors");
const User = require("../models/User.model");
const { authSchema } = require("../helpers/validation_schema");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../helpers/jwt_helper");

router.post("/register", async (req, res, next) => {
  try {
    const sanitizedBody = await authSchema.validateAsync(req.body);

    const foundUser = await User.findOne({ email: sanitizedBody.email });
    if (foundUser)
      throw createError.Conflict(`${sanitizedBody.email} already exists.`);

    const newUser = new User({
      email: sanitizedBody.email,
      password: sanitizedBody.password,
    });
    const savedUser = await newUser.save();
    const accessToken = await signAccessToken(savedUser._id);
    const refreshToken = await signRefreshToken(savedUser._id);

    res.send({ accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const sanitizedBody = await authSchema.validateAsync(req.body);
    const user = await User.findOne({ email: sanitizedBody.email });

    if (!user) throw createError.NotFound("User not registered.");
    const isMatch = await user.isValidPassword(sanitizedBody.password);

    if (!isMatch) throw createError.Unauthorized("Invalid email or password");

    const accessToken = await signAccessToken(user._id);
    const refreshToken = await signRefreshToken(user._id);

    res.send({
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/refresh-token", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw createError().Unauthorized();

    const userId = await verifyRefreshToken(refreshToken);
    const accessToken = await signAccessToken(userId);
    const refToken = await signRefreshToken(userId);

    res.send({
      accessToken,
      refreshToken: refToken,
    });
  } catch (error) {
    next(error);
  }

  res.send("Refresh token route");
});

router.delete("/logout", (req, res, next) => {
  res.send("delete route");
});

module.exports = router;

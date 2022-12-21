const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const client = require("./init_redis");

exports.signAccessToken = (userId) => {
  return new Promise((resolve, reject) => {
    const payload = {
      userId,
    };

    const secretKey = process.env.ACCESS_TOKEN_SECRET;

    const options = {
      expiresIn: "1h",
      audience: userId,
    };

    jwt.sign(payload, secretKey, options, (err, token) => {
      if (err) {
        console.log(err);
        return reject(createError.InternalServerError());
      }

      return resolve(token);
    });
  });
};

exports.verifyAccessToken = (req, res, next) => {
  try {
    if (!req.headers["authorization"]) throw createError.Unauthorized();
    const token = req.headers["authorization"].spilt(" ")[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
      if (err) {
        if (err.name === "JsonWebTokenError") {
          return next(createError.Unauthorized());
        } else {
          return next(createError.Unauthorized(err.message));
        }
      }

      req.payload = payload;
      next();
    });
  } catch (error) {
    next(error);
  }
};

exports.signRefreshToken = (userId) => {
  return new Promise((resolve, reject) => {
    const payload = {
      userId,
    };

    const secretKey = process.env.REFRESH_TOKEN_SECRET;

    const options = {
      expiresIn: "1y",
      audience: userId,
    };

    jwt.sign(payload, secretKey, options, async (err, token) => {
      if (err) {
        console.log(err);
        return reject(createError.InternalServerError());
      }

      try {
        await client.set(userId, token, {
          EX: 365 * 24 * 60 * 60,
        });
        return resolve(token);
      } catch (error) {
        console.log(error.message);
        return reject(createError.InternalServerError());
      }
    });
  });
};

exports.verifyRefreshToken = (refreshToken) => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, payload) => {
        if (err) return reject(createError.Unauthorized());

        try {
          const userId = payload.aud;
          const dbToken = await client.get(userId);
          if (dbToken !== refreshToken)
            return reject(createError.Unauthorized());

          return resolve(userId);
        } catch (error) {
          console.log(error.message);
          return reject(createError.InternalServerError());
        }
      }
    );
  });
};

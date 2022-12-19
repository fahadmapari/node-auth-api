const router = require("express").Router();

router.post("/register", (req, res, next) => {
  res.send("Register route");
});

router.post("/login", (req, res, next) => {
  res.send("Login route");
});

router.post("/refresh-token", (req, res, next) => {
  res.send("Refresh token route");
});

router.delete("/logout", (req, res, next) => {
  res.send("delete route");
});

module.exports = router;

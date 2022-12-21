const redis = require("redis");

const client = redis.createClient({
  url: process.env.REDIS_ENDPOINT,
});

client.connect();

client.on("connect", () => console.log("connected to redis."));

client.on("error", (err) => {
  console.log(err.message);
});

client.on("ready", () => console.log("redis ready"));

client.on("end", () => console.log("redis disconnected"));

process.on("SIGINT", () => {
  client.quit();
});

module.exports = client;

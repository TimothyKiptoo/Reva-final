const mongoose = require("mongoose");
const defaults = require("./defaults");

async function connectDatabase() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(defaults.mongoUri);
  return mongoose.connection;
}

module.exports = {
  connectDatabase,
};

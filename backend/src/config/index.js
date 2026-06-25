require("dotenv").config();

module.exports = {
  databaseUrl: process.env.DATABASE_URL,
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
};

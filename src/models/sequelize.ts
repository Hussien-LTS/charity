// Import the databaseConfig
import { databaseConfig } from "../config/config";

// Assuming you're using Sequelize
import { Sequelize } from "sequelize";
import { environmentAttributes } from "../config/types";

// Set the environment variable
const environment: environmentAttributes = "development";

const config = databaseConfig[environment];

const sequelize = new Sequelize({
  database: "ynnbevvc",
  username: "ynnbevvc",
  password: "sYVxsUAck-Ik1uvNl6GY6e6r98FPdTdF",
  host: "peanut.db.elephantsql.com",

  // database: config.database,
  // username: config.username,
  // password: config.password,
  // host: config.host,
  port: 5432,
  dialect: "postgres",
  dialectOptions: {
    ssl: true,
    rejectUnauthorized: false, // Ignore self-signed certificates
  },
  // logging: process.env.NODE_ENV !== "production" ? console.log : false,
  logging: true,
});

export default sequelize;

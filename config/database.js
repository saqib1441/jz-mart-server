// Importing Necessary Modules
import { Sequelize } from "sequelize";
import { config } from "dotenv";
import mysql from "mysql2/promise";

// Load Environment Variables
config();

// Database Configuration
const { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST } = process.env;

// Function to ensure the database exists before connecting
const ensureDatabaseExists = async () => {
  try {
    // Create a connection to MySQL **without specifying a database**
    const connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
    });

    // Create the database if it doesn’t exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);

    // Close the connection
    await connection.end();
  } catch (error) {
    console.error("Error ensuring database exists:", error.message);
    process.exit(1);
  }
};

// Ensure the database exists before initializing Sequelize
await ensureDatabaseExists();

// Initialize Sequelize
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: "mysql",
  logging: false,
});

export default sequelize;

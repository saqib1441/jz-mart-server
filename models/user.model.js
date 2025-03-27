// Importing Necessary Modules
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

// Initializing User Schema
const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fullname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // role: {
    //   type: DataTypes.ENUM("admin", "vendor", "customer"),
    //   defaultValue: "customer",
    // },
  },
  {
    timestamps: true,
  }
);

export default User;

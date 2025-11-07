import { DataTypes } from "sequelize";
import { sequelize } from "./index.js";

const Auth = sequelize.define(
  "Auth",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false,
      references: {
        model: "users", 
        key: "id", 
      },
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'user',
    },
  },
  {
    tableName: "auths",
    timestamps: true,
  }
);

export default Auth;

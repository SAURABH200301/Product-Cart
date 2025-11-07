import { DataTypes } from "sequelize";
import { sequelize } from "./index.js";
import Category from "./Category.js";

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price :{
        type : DataTypes.TEXT,
        allowNull: false
    },
    categoryId:{
        type: DataTypes.UUID,
        allowNull:false
    }
  },
  {
    tableName: "products",
    timestamps: true,
  }
);

Category.hasMany(Product, {
  foreignKey: 'categoryId',
  onDelete: 'CASCADE',
  hooks: true, 
});

Product.belongsTo(Category, {
  foreignKey: 'categoryId',
});
export default Product;

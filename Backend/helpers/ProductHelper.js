import Category from "../models/Category.js";
import Product from "../models/Product.js";

export async function createProduct(payload) {
  try {
    const categoryExists = await Category.findOne({
      where: { id: payload.categoryId },
    });
    if (!categoryExists) {
      throw new Error("Category with Id does not exists.");
    }
    const exisitngProduct = await Product.findOne({
      where: { name: payload.name },
    });
    if (exisitngProduct) {
      return {
        success: false,
        error: "Product with this name already exists.",
      };
    }
    const product = await Product.create({
      ...payload,
    });
    return {
      success: true,
      data: product,
    };
  } catch (err) {
    throw err;
  }
}

export async function getAllProducts() {
  try {
    const products = await Product.findAll({
      attributes: ["id", "name", "image", "categoryId"],
      include: [
        {
          model: Category, 
          as: 'Category',  
          attributes: ['id', 'name'] 
        }
      ]
    });
    return {
      success: true,
      data: products,
    };
  } catch (err) {
    throw err;
  }
}


export async function getProductById(productId) {
  try {
    const product = await Product.findOne({ id: productId });
    return { success: true, data: product };
  } catch (err) {
    throw err;
  }
}

export async function updateProductById(updatedProd) {
  try {
    const product = await Product.findOne({ id: updatedProd.id });
    if (!product) {
      return { success: false, error: "Product not found." };
    }
    product.name = updatedProd.name ? updatedProd.name : product.name;
    product.image = updatedProd.image ? updatedProd.image : product.image;
    product.price = updatedProd.price ? updatedProd.price : product.price;
    await product.save();
    return {
      success: true,
      message: "Product updated successfully.",
      data: product,
    };
  } catch (err) {
    throw err;
  }
}

export async function deleteProductById(productId) {
  try {
    const product = await Product.findByPk(productId);
    if (!product) {
      return { success: false, error: "Product not found." };
    }
    await Product.destroy({ where: { id: productId } });
    return { success: true, message: "Product deleted successfully." };
  } catch (err) {
    throw err;
  }
}

export async function bulkUploadProduct(products) {
  try {
    const insertedProducts = await Product.bulkCreate(products, {
      validate: true,
      ignoreDuplicates: true,
    });
    return {
      success: true,
      message: `${insertedProducts.length} products uploaded successfully`,
      data: insertedProducts,
    };
  } catch (err) {
    throw err;
  }
}

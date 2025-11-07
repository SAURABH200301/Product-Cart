import Category from "../models/Category.js";

export async function createCategory(name, description) {
  try {
    const existingCategory = await Category.findOne({
      where: { name: name },
    });
    if (existingCategory) {
      return {
        success: false,
        error: "Category with this name already exists.",
      };
    }
    await Category.create({
      name,
      description,
    });
    return {
      success: true,
      message: `Category with name: ${name} is created.`,
    };
  } catch (err) {
    return { success: false, message: err };
  }
}

export async function getAllCategory() {
  try {
    const categories = await Category.findAll({
      attributes: ["id", "name", "description"],
    });
    return { success: true, data: categories };
  } catch (err) {
    throw err;
  }
}

export async function getCategoryById(categoryId) {
  try {
    const category = await Category.findOne({ id: categoryId });
    return { success: true, data: category };
  } catch (err) {
    throw err;
  }
}

export async function updateCategoryById(category, updatedCategory) {
  try {
    const categoryWithId = await Category.findByPk(category.id);
    if (!categoryWithId) {
      return { success: false, error: "Category not found." };
    }
    categoryWithId.name =
      updatedCategory?.name && updatedCategory?.name.length === 0
        ? categoryWithId.name
        : updatedCategory.name;
    categoryWithId.description =
      updatedCategory?.description && updatedCategory?.description.length === 0
        ? categoryWithId.description
        : updatedCategory.description;
    await categoryWithId.save();
    return {
      success: true,
      message: "Category updated successfully.",
      data: categoryWithId,
    };
  } catch (err) {
    throw err;
  }
}

export async function deleteCategoryById(categoryId) {
  try {
    const user = await Category.findByPk(categoryId);
    if (!user) {
      return { success: false, error: "Category not found." };
    }
    await Category.destroy({ where: { id: categoryId } });
    return { success: true, message: "Category deleted successfully." };
  } catch (error) {
    console.error("Error in deleteUserById:", error);
    throw error;
  }
}

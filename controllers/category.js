const mongoose = require("mongoose");
const Category = require("../models/Category");

module.exports = {
  createCategory: async (req, res) => {
    try {
      const userId = req.user._id;

      const category = await new Category({
        ...req.body,
        user: userId,
      }).save();

      res.status(201).send({ data: category });
    } catch (error) {
      console.error("Error creating category:", error.message);
      res.status(500).send({ message: "Error creating category", error: error.message });
    }
  },

  getAllCategories: async (req, res) => {
    try {
      const userId = req.user._id;
      const categories = req.user.role === "admin" ? await Category.find().select("-user") : await Category.find({ user: userId }).select("-user");

      if (!categories.length) {
        return res.status(404).send({ message: "Categories not found" });
      }

      res.status(200).send({ data: categories });
    } catch (error) {
      console.error("Error fetching categories:", error.message);
      res.status(500).send({ message: "Error fetching categories", error: error.message });
    }
  },

  getCategoryById: async (req, res) => {
    try {
      const { id } = req.params;

      const category = await Category.findById(id);

      if (!category) {
        return res.status(404).send({ message: "Category not found" });
      }

      const categoryData = category.toObject();
      delete categoryData.user;

      res.status(200).send({ data: categoryData });
    } catch (error) {
      console.error("Error fetching category:", error.message);
      res.status(500).send({ message: "Error fetching category", error: error.message });
    }
  },

  updateCategory: async (req, res) => {
    try {
      const { id } = req.params;

      const category = await Category.findById(id);

      if (!category) {
        return res.status(404).send({ message: "Category not found" });
      }

      const updatedCategory = await Category.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

      const updatedCategoryData = updatedCategory.toObject();
      delete updatedCategoryData.user;

      res.status(200).send({ data: updatedCategoryData });
    } catch (error) {
      console.error("Error updating category:", error.message);
      res.status(500).send({ message: "Error updating category", error: error.message });
    }
  },

  deleteCategory: async (req, res) => {
    try {
      const { id } = req.params;

      const category = await Category.findById(id);

      if (!category) {
        return res.status(404).send({ message: "Category not found" });
      }

      const deletedCategory = await Category.findByIdAndDelete(id);
      
      const deletedCategoryData = deletedCategory ? deletedCategory.toObject() : null;

      if (deletedCategoryData) {
        delete deletedCategoryData.user;
      }

      res.status(200).send({ data: deletedCategoryData });
    } catch (error) {
      console.error("Error deleting category:", error.message);
      res.status(500).send({ message: "Error deleting category", error: error.message });
    }
  },
};

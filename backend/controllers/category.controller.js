import Category from "../models/category.model.js";
import { buildFilter } from "../utilities/searchUtils.js";
import Activity from "../models/activity.model.js";

export const createCategory = async (req, res) => {
	try {
		const category = await Category.create(req.body);
		res.status(201).json(category);
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};

export const getCategories = async (req, res) => {
	try {
		const categories = await Category.find();
		res.status(200).json(categories);
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
};
export const getCategoryByID = async (req, res) => {
	try {
		const category = await Category.findById(req.params.id);
		if (category) {
			res.status(200).json(category);
		} else {
			res.status(404).json({ message: "Category not found" });
		}
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};

export const updateCategory = async (req, res) => {
	try {
		const category = req.params.id;
		const result = await Category.findByIdAndDelete(category);
		if (result) {
			try {
				const updatedCategory = await Category.create(req.body);
				const activities = await Activity.find({ category });
				activities.forEach(async (activity) => {
					activity.category = updatedCategory._id;
					await activity.save();
				});
				res.status(200).json(updatedCategory);
			} catch (error) {
				const updatedCategory = await Category.create({
					_id: category,
				});
				res.status(500).json({
					message: "Updated category already exists",
				});
			}
		} else {
			res.status(404).json({ message: "category not found" });
		}
	} catch (e) {
		res.status(400).json({ error: e.message });
	}
};

export const deleteCategory = async (req, res) => {
	try {
		const category = req.params.id;

		const result = await Category.findByIdAndDelete(category);
		if (result) {
			const activities = await Activity.find({ category });
			activities.forEach(async (activity) => {
				activity.category = null;
				await activity.save();
			});
			res.status(200).json({ message: "Category deleted successfully" });
		} else {
			res.status(404).json({ message: "Category not found" });
		}
	} catch (e) {
		res.status(400).json({ error: e.message });
	}
};

export const searchCategories = async (req, res) => {
	try {
		const query = buildFilter(req.query);
		const categories = await Category.find(query);
		res.status(200).json(categories);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

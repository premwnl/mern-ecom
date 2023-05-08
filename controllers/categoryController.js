import categoryModal from "../models/categoryModal.js";
import slugify from "slugify";

export const createCategoryController = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(200).send({
        success: false,
        message: "Name is required",
      });
    }
    const existingModal = await categoryModal.findOne({ name });
    if (existingModal) {
      return res.status(200).send({
        success: false,
        message: "Category Already exists",
      });
    }
    const category = await new categoryModal({
      name,
      slug: slugify(name),
    }).save();
    res.status(201).send({
      success: true,
      message: "New category created",
      category,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      message: "Error while creating category",
      err,
    });
  }
};

export const updateCategoryController = async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;
    if (!name) {
      return res.status(200).send({
        success: false,
        message: "Name is required",
      });
    }
    const existingModal = await categoryModal.findOne({ name });
    if (existingModal) {
      return res.status(200).send({
        success: false,
        message: "Category Already exists",
      });
    }
    const category = await categoryModal.findByIdAndUpdate(
      id,
      { name, slug: slugify(name) },
      { new: true }
    );
    await category.save();
    res.status(201).send({
      success: true,
      message: "Category updated",
      category,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      message: "Error while updating category",
      err,
    });
  }
};

export const getCategoryController = async (req, res) => {
  try {
    const category = await categoryModal.find({});
    res.status(201).send({
      success: true,
      message: "All Categories",
      category,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      message: "Error while getting all category",
      err,
    });
  }
};

export const singleCategoryController = async (req, res) => {
  try {
    const category = await categoryModal.findOne({ slug: req.params.slug });
    res.status(201).send({
      success: true,
      message: "single Categories",
      category,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      message: "Error while getting single category",
      err,
    });
  }
};

export const deleteCategoryController = async (req, res) => {
  try {
    await categoryModal.findByIdAndDelete({ _id: req.params.id });
    res.status(201).send({
      success: true,
      message: "deleted Category",
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      message: "Error while deleting category",
      err,
    });
  }
};

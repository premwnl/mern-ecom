import productModal from "../models/productModal.js";
import categoryModal from "../models/categoryModal.js";
import orderModal from "../models/orderModal.js";
import slugify from "slugify";
import fs from "fs";
import braintree from "braintree";
import dotenv from "dotenv";

dotenv.config();
//payment gateway
var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

export const createProductController = async (req, res) => {
  try {
    const { name, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;

    //validation
    switch (true) {
      case !category:
        return res
          .status(200)
          .send({ success: false, message: "Category is Required" });
      case !photo:
        return res
          .status(200)
          .send({ success: false, message: "Photo is Required" });
      case photo && photo.size > 1000000:
        return res.status(200).send({
          success: false,
          message: "photo is Required and should be less then 1mb",
        });
      case !name:
        return res
          .status(200)
          .send({ success: false, message: "Name is Required" });
      case !description:
        return res
          .status(200)
          .send({ success: false, message: "Description is Required" });
      case !price:
        return res
          .status(200)
          .send({ success: false, message: "Price is Required" });
      case price < 1:
        return res
          .status(200)
          .send({ success: false, message: "Price must be Greater than zero" });
      case !quantity:
        return res
          .status(200)
          .send({ success: false, message: "Quantity is Required" });
      case quantity < 1:
        return res.status(200).send({
          success: false,
          message: "quantity must be Greater than zero",
        });
      case !shipping:
        return res
          .status(200)
          .send({ success: false, message: "shipping is Required" });
    }
    const existingModal = await productModal.findOne({ name });
    if (existingModal) {
      return res.status(200).send({
        success: false,
        message: "Product Already exists",
      });
    }
    const products = new productModal({ ...req.fields, slug: slugify(name) });
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();
    res.status(201).send({
      success: true,
      message: "New Product created",
      products,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      message: "Error in Creating Product",
      err,
    });
  }
};

export const updateProductController = async (req, res) => {
  try {
    const { name, slug, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;

    //validation
    switch (true) {
      case !category:
        return res
          .status(200)
          .send({ success: false, message: "Category is Required" });
      case photo && photo.size > 1000000:
        return res.status(200).send({
          success: false,
          message: "photo is Required and should be less then 1mb",
        });
      case !name:
        return res
          .status(200)
          .send({ success: false, message: "Name is Required" });
      case !description:
        return res
          .status(200)
          .send({ success: false, message: "Description is Required" });
      case !price:
        return res
          .status(200)
          .send({ success: false, message: "Price is Required" });
      case price < 1:
        return res.status(200).send({
          success: false,
          message: "Price must be Greater than zero",
        });
      case !quantity:
        return res
          .status(200)
          .send({ success: false, message: "Quantity is Required" });
      case quantity < 1:
        return res.status(200).send({
          success: false,
          message: "quantity must be Greater than zero",
        });
      case !shipping:
        return res
          .status(200)
          .send({ success: false, message: "shipping is Required" });
    }

    const products = await productModal.findByIdAndUpdate(
      req.params.pid,
      { ...req.fields, slug: slugify(name) },
      { new: true }
    );
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();
    res.status(201).send({
      success: true,
      message: "Product updated",
      products,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      message: "Error in updating Product",
      err,
    });
  }
};

export const getProductController = async (req, res) => {
  try {
    const products = await productModal
      .find({})
      .populate("category")
      .select("-photo")
      .limit(12)
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      message: "All Products fetched",
      products,
      total: products.length,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      message: "Error while getting products",
      error: err.message,
    });
  }
};

export const getSingleProductController = async (req, res) => {
  try {
    const product = await productModal
      .findOne({ slug: req.params.slug })
      .select("-photo")
      .populate("category");
    res.status(200).send({
      success: true,
      message: "Single Products fetched",
      product,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      message: "Error while getting Single product",
      error: err.message,
    });
  }
};

export const productPhotoController = async (req, res) => {
  try {
    const product = await productModal.findById(req.params.pid).select("photo");
    if (product.photo.data) {
      res.set("Content-type", product.photo.contentType);
    }
    return res.status(200).send(product.photo.data);
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      message: "Error while getting product photo",
      error: err.message,
    });
  }
};

export const deleteProductController = async (req, res) => {
  try {
    await productModal.findByIdAndDelete(req.params.pid).select("-photo");

    res.status(200).send({
      success: true,
      message: "Product deleted succesfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      message: "Error while deleting product",
      error: err.message,
    });
  }
};

export const productFiltersController = async (req, res) => {
  try {
    const { checked, radio } = req.body;
    let args = {};
    if (checked.length > 0) args.category = checked;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };

    const products = await productModal.find(args);

    res.status(201).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error while filtering products",
      error,
    });
  }
};

export const productCountController = async (req, res) => {
  try {
    const total = await productModal.find({}).estimatedDocumentCount();
    res.status(200).send({
      success: true,
      total,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error while counting products",
      error,
    });
  }
};

export const productListController = async (req, res) => {
  try {
    const perPage = 6;
    const page = req.params.page ? req.params.page : 1;
    const products = await productModal
      .find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error while listing products",
      error,
    });
  }
};

export const searchProductController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const results = await productModal
      .find({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ],
      })
      .select("-photo");
    res.json(results);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error while searching products",
      error,
    });
  }
};

export const relatedProductController = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    const products = await productModal
      .find({ category: cid, _id: { $ne: pid } })
      .select("-photo")
      .limit(3)
      .populate("category");
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error while searching related products",
      error,
    });
  }
};

export const productCategoryController = async (req, res) => {
  try {
    const category = await categoryModal.findOne({ slug: req.params.slug });
    const product = await productModal.find({ category }).populate("category");
    res.status(200).send({
      success: true,
      category,
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error while getting product-category",
      error,
    });
  }
};

export const braintreeTokenController = async (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

export const braintreePaymentController = async (req, res) => {
  try {
    const { nonce, cart } = req.body;
    let total = 0;
    cart.map((i) => {
      total += i.price;
    });
    let newTransaction = gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      function (error, result) {
        if (result) {
          const order = new orderModal({
            products: cart,
            payment: result,
            buyer: req.user._id,
          }).save();
          res.json({ ok: true });
        } else {
          res.status(500).send(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

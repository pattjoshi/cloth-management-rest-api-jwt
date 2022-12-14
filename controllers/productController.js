import { Product } from "../models";
import multer from "multer";
import path from "path";
import CustomErrorHandler from "../services/CustomErrorHandler";
import fs from "fs";
import Joi from "joi";
import productSchema from "../validators/productValidator";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    // 3746674586-836534453.png
    cb(null, uniqueName);
  },
});

const handleMultipartData = multer({
  storage,
  limits: { fileSize: 1000000 * 5 },
}).single("image"); //5mb

const productController = {
  async store(req, res, next) {
    try {
      // Multipart form data
      handleMultipartData(req, res, async (err) => {
        if (err) {
          return CustomErrorHandler.serverError(err.message);
        }
        // console.log(req.file);
        const filePath = req.file.path;
        // validation

        const { error } = productSchema.validate(req.body);
        if (error) {
          // delete the Uploade file
          fs.unlink(`${appRoot}/${filePath}`, (err) => {
            if (err) {
              return next(CustomErrorHandler.serverError(err.message));
            }
            // rootfolder/upload/filename.pang
          });
          return next(error);
        }
        const { name, price, size, color, type } = req.body;
        let document;
        try {
          document = await Product.create({
            name,
            price,
            size,
            color,
            type,
            image: filePath,
          });
        } catch (error) {
          return next(error);
        }
        res.status(201).json(document);
      });
    } catch (error) {
      next(error);
    }
  },
  update(req, res, next) {
    handleMultipartData(req, res, async (err) => {
      if (err) {
        return CustomErrorHandler.serverError(err.message);
      }
      // console.log(req.file);
      let filePath;
      if (req.file) {
        filePath = req.file.path;
      }
      // validation

      const { error } = productSchema.validate(req.body);
      if (error) {
        // delete the Uploade file
        if (req.file) {
          fs.unlink(`${appRoot}/${filePath}`, (err) => {
            if (err) {
              return next(CustomErrorHandler.serverError(err.message));
            }
            // rootfolder/upload/filename.pang
          });
        }
        return next(error);
      }
      const { name, price, size, color, type } = req.body;
      let document;
      try {
        document = await Product.findOneAndUpdate(
          { _id: req.params.id },
          {
            name,
            price,
            size,
            color,
            type,
            ...(req.file && { image: filePath }),
          },
          { new: true }
        );
        // console.log(document);
      } catch (error) {
        return next(error);
      }
      res.status(201).json(document);
    });
  },
  // DELETE /products/:id
  async destroy(req, res, next) {
    const document = await Product.findOneAndRemove({ _id: req.params.id });
    if (!document) {
      return next(new Error("Nothing to delete"));
    }
    // image delete
    const imagePath = document._doc.image;
    // http://localhost:5000/uploads/1616444052539-425006577.png
    // approot/http://localhost:5000/uploads/1616444052539-425006577.png
    fs.unlink(`${appRoot}/${imagePath}`, (err) => {
      if (err) {
        return next(CustomErrorHandler.serverError(err.message));
      }
    });
    res.json(document);
  },

  // GET ALL PRODECT
  async index(req, res, next) {
    let document;
    try {
      document = await Product.find()
        .select("-updatedAt -__v")
        .sort({ _id: -1 });
    } catch (error) {
      return next(CustomErrorHandler.serverError(err.message));
    }
    return res.json(document);
  },
  // get single product
  async show(req, res, next) {
    let document;
    try {
      document = await Product.findOne({ _id: req.params.id }).select(
        "-updatedAt -__v"
      );
    } catch (err) {
      return next(CustomErrorHandler.serverError());
    }
    return res.json(document);
  },
};

export default productController;

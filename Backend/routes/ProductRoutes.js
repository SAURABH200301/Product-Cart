import express from "express";
import { body, validationResult } from "express-validator";
import { Op } from "sequelize";

import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProductById,
  deleteProductById,
} from "../helpers/ProductHelper.js";
import { paginate } from "../helpers/Pagination.js";
import { generateCSV, generateXLSX } from "../helpers/FileDownload.js";
import authJWT from "../middleware/AuthJWT.js";
import Product from "../models/Product.js";

const router = express.Router();

const Filetypes = {
  CSV: "csv",
  XLSX: "xlsx",
};
const FileName = "product";

//Router 1: Create Product. Login required.
router.post(
  "/",
  authJWT,
  [
    body("name", "Enter the name of the product").isLength({ min: 3 }),
    body("image", "Enter the image file name").isLength({ min: 5 }),
    body("price", "Enter the price of the product").notEmpty(),
    body("categoryId", "Enter the category id").notEmpty(),
  ],
  authJWT,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const resp = await createProduct(req?.body);
      if (!resp.success) {
        throw new Error(resp.error);
      }
      res.status(201).json(resp.data);
    } catch (err) {
      res.status(400).json({ error: err?.message });
    }
  }
);

//Router 2: Get All products, pagination + filters + sorting
router.get("/all", authJWT, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filter = req.query.filter;
    const searchTerm = req.query.search || "";
    const sort = req.query.sort || "DESC";

    let baseFilter = {};
    try {
      baseFilter = filter ? JSON.parse(filter) : {};
    } catch {
      baseFilter = {};
    }

    let where = {
      ...baseFilter,
    };

    if (searchTerm) {
      where.name = {
        [Op.iLike]: `%${searchTerm}%`,
      };
    }

    const query = {
      where,
      order: [["name", sort]],
    };
    const resp = await paginate(Product, query, page, limit);
    if (!resp.success) {
      throw resp.error;
    }
    res.status(200).json(resp);
  } catch (err) {
    res.status(400).json({ error: err?.message });
  }
});

//Router 3: Get product By Id. Login required
router.get("/:productId", authJWT, async (req, res) => {
  try {
    const prodId = req.params.productId;
    const resp = await getProductById(prodId);
    if (!resp.success) {
      throw err;
    }
    res.status(200).json(resp);
  } catch (err) {
    res.status(400).json({ error: err?.message });
  }
});

//Router 4: Update the product
router.patch(
  "/:productId",
  authJWT,
  [
    body("name", "Enter the updated name of the product").optional(),
    body("image", "Enter the updated image of the product").optional(),
    body("price", "Enter the updated price of the product").optional(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const resp = await updateProductById(req?.body);
      if (!resp.success) {
        throw resp.error;
      }
      res.status(200).json(resp);
    } catch (err) {
      res.status(400).json({ error: err?.message });
    }
  }
);

//Router 5: Delete the product by Id
router.delete("/:productId", authJWT, async (req, res) => {
  try {
    const prodId = req.params.productId;
    const resp = await deleteProductById(prodId);
    if (!resp.success) {
      throw resp.error;
    }
    res.status(200).json(`Product with Id: ${prodId} has been deleted.`);
  } catch (err) {
    res.status(400).json({ error: err?.message });
  }
});

//Router 6: Upload bulk
router.post(
  "/bulk-upload",
  authJWT,
  body("products")
    .isArray({ min: 1 })
    .withMessage("Products array is required"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const products = req.body.products;

    try {
      const resp = await bulkUploadProduct(products);
      if (!resp.success) {
        throw resp.error;
      }

      res.status(201).json(resp);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

//Router 7: download csv or xlsx
router.get("/download/:filetype", authJWT, async (req, res) => {
  const filetype = req.params.filetype;
  try {
    const resp = await getAllProducts();
    if (!resp.success) {
      throw err;
    }
    const products = resp.data.map((product) => {
      const plainProduct = product.get({ plain: true });
      delete plainProduct.categoryId;
      plainProduct.category = product.Category?.name || null;
      delete plainProduct.Category
      return plainProduct;
    });

    switch (filetype) {
      case Filetypes.CSV:
        await generateCSV(`${FileName}.${filetype}`, products);

        break;
      case Filetypes.XLSX:
        await generateXLSX(`${FileName}.${filetype}`, products);
        break;
      default:
        throw new Error("Please enter the correct filetype");
    }

    res.download(
      `${FileName}.${filetype}`,
      `${FileName}.${filetype}`,
      (err) => {
        if (err) {
          res.status(500).send("Error downloading the file.");
        } else {
          console.log("File sent:", FileName);
        }
      }
    );
  } catch (err) {
    res.status(400).json({ error: err?.error });
  }
});
export default router;

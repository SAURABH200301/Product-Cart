import express from "express";
import { body, validationResult } from "express-validator";
import {
  createCategory,
  getAllCategory,
  getCategoryById,
  updateCategoryById,
  deleteCategoryById
} from "../helpers/CategoryHelper.js";
import authJWT from "../middleware/AuthJWT.js";

const router = express.Router();

// Router 1: Create a Category using: POST "/api/category". Login required
router.post(
  "/",
  authJWT,
  [
    body("name", "Enter the valid name").isLength({ min: 3 }),
    body("description", "Please enter the description").notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const resp = await createCategory(req.body.name, req.body.description);
      if (!resp.success) {
        throw new Error(resp.error);
      }
      res.status(200).json(resp);
    } catch (err) {
      res.status(400).json({ error: err?.message });
    }
  }
);

//Router 2: Get All categories. Login required
router.get("/all", authJWT, async (req, res) => {
  try {
    const resp = await getAllCategory();
    if (!resp.success) {
      throw new Error(resp.error);
    }
    res.status(200).json(resp.data);
  } catch (err) {
    res.status(400).json({ error: err?.message });
  }
});

//Router 3: Get Category by ID. Login required
router.get("/:categoryId", authJWT, async (req, res) => {
  try {
    const catId = req.params.categoryId;
    const resp = await getCategoryById(catId);
    if (!resp.success) {
      throw new Error(resp.error);
    }
    return res.status(200).json(resp.data);
  } catch (err) {
    res.status(400).json({ error: err?.message });
  }
});

//Router 4: Update Category by ID Login required.
router.patch(
  "/:categoryId",
  authJWT,
  [
    body("name").optional().isLength({ min: 3 }),
    body("description").optional().notEmpty(),
  ],
  async (req, res) => {
    try {
      const catId = req.params.categoryId;
      const name = req.body.name;
      const description = req.body.description;
      const resp = await getCategoryById(catId);
      if (!resp.success) {
        throw new Error(resp.error);
      }
      const updatedResp = await updateCategoryById(resp.data, {
        name,
        description,
      });
      if (!updatedResp.success) {
        throw new Error(updatedResp.error);
      }
      res.status(200).json(updatedResp);
    } catch (err) {
      res.status(400).json({ error: err?.message });
    }
  }
);

//Router 5: Delete Category byID Login required.
router.delete("/:categoryId",authJWT,async(req,res)=>{
    const catId= req.params.categoryId;
    try{
        const resp = await deleteCategoryById(catId);
        if(!resp.success){
            throw new Error(resp.error);
        }
        res.status(200).json(resp.error)
    }catch(err){
        res.status(400).json({error:err?.message})
    }
})
export default router;

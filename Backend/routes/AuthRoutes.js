import express from "express";
import { body, validationResult } from "express-validator";
import {
  signupHelper,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  loginHelper,
} from "../helpers/AuthHelper.js";
import authJWT from "../middleware/AuthJWT.js";

const router = express.Router();

// Route 1: Create a User using: POST "/api/auth/createuser". No login required
router.post(
  "/signup",
  [
    body("name", "Enter the valid name").isLength({ min: 3 }),
    body("email", "Enter the valid mail id").isEmail(),
    body("password", "Password must be atleast 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    console.log("error",req)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const resp = await signupHelper({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      });
      if (!resp.success) {
        throw new Error(resp.error);
      }
      res.status(200).json(resp);
    } catch (error) {
      res.status(400).json({ error: error?.message });
    }
  }
);

// Route 2: Get all users using: GET "/api/auth/all". Login required
router.get("/all", authJWT, async (req, res) => {
  try {
    const resp = await getAllUsers();
    res.status(200).json(resp);
  } catch (error) {
    res.status(400).json({ error: error?.message });
  }
});

// Route 3: Get user by ID using: GET "/api/auth/:userId". Login required
router.get("/:userId", authJWT, async (req, res) => {
  try {
    const userId = req.params.userId;
    const resp = await getUserById(userId);
    res.status(200).json(resp);
  } catch (error) {
    res.status(400).json({ error: error?.message });
  }
});

// Route 4: Update user by ID using: PUT "/api/auth/:userId". Login required
router.patch(
  "/:userId",
  [body("name", "Enter the valid name").isLength({ min: 3 })],
  authJWT,
  async (req, res) => {
    const userId = req.params.userId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const resp = await updateUserById(userId, req.body.name);
      res.status(200).json(resp);
    } catch (err) {
      res.status(400).json({ error: err?.message });
    }
  }
);

// Route 5: Delete user by ID using: DELETE "/api/auth/:userId". Login required
router.delete("/:userId", authJWT, async (req, res) => {
  const userId = req.params.userId;
  try {
    const resp = await deleteUserById(userId);
    res.status(200).json(resp);
  } catch (err) {
    res.status(400).json({ error: err?.message });
  }
});


// Route 6: Login a User using: POST "/api/auth/login". No login required
router.post(
  "/login",
  [
    body("email", "Enter the valid mail id").isEmail(),
    body("password", "Password must be atleast 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    try {
      const { email, password } = req.body;
      const resp = await loginHelper(email, password);
      if (!resp.success) {
        throw new Error(resp.error);
      }
      return res.status(200).json(resp);
    } catch (error) {
      return res.status(400).json({ error: error?.message });
    }
  }
);

export default router;

import User from "../models/User.js";
import Auth from "../models/Auth.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const secretKey = process.env.JWT_SECRET_KEY;

export function validateJWT(token) {
  try {
    const decoded = jwt.verify(token, secretKey);
    return true;
  } catch (err) {
    return false;
  }
}

export function generateJWT(user) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const options = {
    expiresIn: "1h",
  };

  const token = jwt.sign(payload, secretKey, options);
  return token;
}

export async function signupHelper({ name, email, password }) {
  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return { success: false, error: "User with this email already exists." };
    }
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const newUser = await User.create({ name, email });
    await Auth.create({
      user_id: newUser.id,
      password_hash,
      role: "user",
    });
    const token = generateJWT(newUser);
    return { success: true, message: "User created successfully.", token };
  } catch (error) {
    console.error("Error in signupHelper:", error);
    throw error;
  }
}

export async function getAllUsers() {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "email", "createdAt", "updatedAt"],
    });
    return { success: true, data: users };
  } catch (error) {
    throw error;
  }
}

export async function getUserById(userId) {
  try {
    const user = await User.findByPk(userId, {
      attributes: ["id", "name", "email", "createdAt", "updatedAt"],
    });
    if (!user) {
      return { success: false, error: "User not found." };
    }
    return { success: true, data: user };
  } catch (error) {
    console.error("Error in getUserById:", error);
    throw error;
  }
}

export async function updateUserById(userId, name) {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return { success: false, error: "User not found." };
    }
    user.name = name;
    await user.save();
    return { success: true, message: "User updated successfully.", data: user };
  } catch (error) {
    console.error("Error in updateUserById:", error);
    throw error;
  }
}

export async function deleteUserById(userId) {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return { success: false, error: "User not found." };
    }
    await Auth.destroy({ where: { user_id: userId } });
    await user.destroy();
    return { success: true, message: "User deleted successfully." };
  } catch (error) {
    console.error("Error in deleteUserById:", error);
    throw error;
  }
}

export async function loginHelper(email, password) {
  try {
    const userRecord = await User.findOne({ where: { email } });
    if (!userRecord) {
      return { success: false, error: "Invalid email or password." };
    }
    const authRecord = await Auth.findOne({
      where: { user_id: userRecord.id },
    });
    if (!authRecord) {
      return { success: false, error: "Invalid email or password." };
    }
    const isMatch = await bcrypt.compare(password, authRecord.password_hash);
    if (!isMatch) {
      return { success: false, error: "Invalid email or password." };
    }
    const user = await User.findByPk(authRecord.user_id);
    const token = generateJWT(user);
    return { success: true, message: "Login successful.", token };
  } catch (error) {
    console.error("Error in loginHelper:", error);
    throw error;
  }
}

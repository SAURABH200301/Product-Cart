import { validateJWT } from "../helpers/AuthHelper.js";

export default function authJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Authorization token missing or malformed" });
  }

  const token = authHeader.split(" ")[1];
  if (validateJWT(token)) {
    next();
  } else {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

/* eslint-disable no-undef */
import { config } from "dotenv";
config();
import express, { json } from "express";
import cors from "cors";
import connectToDatabase from "./database.js";
import { startServer } from "./serverInit.js";
import AuthRoutes from "./routes/AuthRoutes.js";
import CategoryRoutes from "./routes/CategoryRoutes.js";
import ProductRoutes from "./routes/ProductRoutes.js";
import ImageRoutes from "./routes/ImageRoutes.js";
import dotenv from "dotenv";

const app = express();
dotenv.config();

app.use(cors());
app.use(
  cors({
    origin: `${process.env.PROTOCAL}://${process.env.DB_HOST}:${process.env.FE_PORT}`,
    credentials: true,
  })
);
app.use(json());
await connectToDatabase();

app.use("/api/auth", AuthRoutes);
app.use("/api/category", CategoryRoutes);
app.use("/api/image", ImageRoutes);
app.use("/api/product", ProductRoutes);
const port = process.env.PORT || 8080;

await startServer(port, app);

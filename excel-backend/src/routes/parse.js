import express from "express";
import { verifyToken } from "../middleware/auth.js ";
import { parseExcel } from "../controllers/parseController.js";

const router = express.Router();

router.get("/:id", verifyToken(), parseExcel);

export default router;

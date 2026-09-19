import express from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  getUserUploads,
  getStats,
  getHistoryById,
  updateChartHistory,
  getChartGallery,
} from "../controllers/historyController.js";

const router = express.Router();

router.get("/", verifyToken(["user", "admin"]), getUserUploads);
router.get("/:id", verifyToken(["user", "admin"]), getHistoryById);
router.get("/stats", verifyToken(["user", "admin"]), getStats);
router.get("/charts/gallery", verifyToken(["user", "admin"]), getChartGallery);
router.put("/:id/chart", verifyToken(["user", "admin"]), updateChartHistory);
// router.delete("/:id", verifyToken(["user", "admin"]), deleteHistoryById);;

export default router;

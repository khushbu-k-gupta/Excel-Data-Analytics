import { Router } from "express";
import upload, { avatarUpload } from "../middleware/upload.js";
import { verifyToken } from "../middleware/auth.js";
import {
  uploadExcel,
  downloadFile,
  deleteFile,
  uploadAvatar,
} from "../controllers/fileController.js";

const router = Router();
const auth = verifyToken(["user", "admin"]);

router.post("/upload", auth, upload.single("file"), uploadExcel);
router.post("/avatar", auth, avatarUpload.single("file"), uploadAvatar);
router.get("/:id/download", auth, downloadFile);
router.delete("/:id", auth, deleteFile);

export default router;

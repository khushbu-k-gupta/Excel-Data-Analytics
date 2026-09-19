import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  getAllUploads,
  getUploadsByUserId,
  deleteUser,
  getAllUsers,
  getAdminStats,
  toggleUserRole,
  getUserById,
  toggleBlockUser,
  bulkDeleteFiles,
} from "../controllers/adminController.js";

const router = Router();
const adminOnly = verifyToken(["admin"]);

router.get("/stats", adminOnly, getAdminStats);
router.get("/users", adminOnly, getAllUsers);
router.get('/users/:id', adminOnly, getUserById);
router.get("/uploads", adminOnly, getAllUploads);
router.get("/users/:userId/uploads", adminOnly, getUploadsByUserId);
router.patch('/users/:id/role', adminOnly, toggleUserRole);
router.patch("/users/:id/status", adminOnly, toggleBlockUser);
router.delete("/users/:id", adminOnly, deleteUser);
router.post('/files/bulk-delete', adminOnly, bulkDeleteFiles);
export default router;

import asyncHandler from "../utils/asyncHandler.js";
import UploadHistory from "../models/UploadHistory.js";
import User from "../models/User.js";
import mongoose from "mongoose";

import path from "path";
import fs from "fs";

const UPLOADS_DIR = path.resolve("uploads");

export const getAllUploads = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  const { page = 1, limit = 20 } = req.query;

  const [uploads, total] = await Promise.all([
    UploadHistory.find()
      .populate("user", "username useremail")
      .sort({ uploadDate: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    UploadHistory.countDocuments(),
  ]);

  res.json({ uploads, total, page: Number(page) });
});

export const getUploadsByUserId = asyncHandler(async (req, res) => {
  const targetUserId = req.params.userId;

  if (req.user.role !== "admin" && targetUserId !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const uploads = await UploadHistory.find({ user: targetUserId }).sort({
    uploadDate: -1,
  });
  res.json(uploads);
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const { search = "", page = 1, limit = 20 } = req.query;

  const query = search
    ? {
        $or: [
          { username: { $regex: search, $options: "i" } },
          { useremail: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    User.countDocuments(query),
  ]);

  res.json({ users, total, page: Number(page) });
});

export const getAdminStats = asyncHandler(async (req, res) => {
  const [
    totalUsers, totalFiles, totalAdmins, chartsCreated,
    topUsers, chartUsage,            // 🆕 features
    userGrowth, uploadGrowth,        // ✅ wapas add — ye bhi chahiye!
    storage,                         // ✅ ye bhi
  ] = await Promise.all([
    User.countDocuments(),
    UploadHistory.countDocuments(),
    User.countDocuments({ role: 'admin' }),
    UploadHistory.countDocuments({ chartType: { $ne: '-' } }),

    // Top 5 users by file count
    UploadHistory.aggregate([
      {
        $group: {
          _id: '$user',
          fileCount: { $sum: 1 },
          storage: { $sum: '$fileSize' },
        },
      },
      { $sort: { fileCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: '$user._id',
          username: '$user.username',
          email: '$user.useremail',
          fileCount: 1,
          storage: 1,
        },
      },
    ]),

    // Chart type distribution
    UploadHistory.aggregate([
      { $match: { chartType: { $ne: '-' } } },
      { $group: { _id: '$chartType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),

    // ✅ User growth (monthly)
    User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 6 },
    ]),

    // ✅ Upload growth (monthly)
    UploadHistory.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$uploadDate' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 6 },
    ]),

    // ✅ Total storage
    UploadHistory.aggregate([
      { $group: { _id: null, totalSize: { $sum: '$fileSize' } } },
    ]),
  ]);

  res.json({
    totalUsers,
    totalFiles,
    chartsCreated,
    admins: totalAdmins,
    storageUsed: storage[0]?.totalSize || 0,
    userGrowth: userGrowth.map((g) => ({ month: g._id, users: g.count })),
    uploadGrowth: uploadGrowth.map((g) => ({ month: g._id, uploads: g.count })),
    topUsers,
    chartUsage: chartUsage.map((c) => ({ name: c._id, value: c.count })),
  });
});

export const toggleUserRole = asyncHandler(async (req, res) => {
  const target = await User.findById(req.params.id).select("-password");
  if (!target) return res.status(404).json({ message: "User not found" });

  // Self-protection — admin apna role nahi badal sakta (accidental lockout se bacho)
  if (target._id.toString() === req.user.id) {
    return res.status(400).json({ message: "You cannot change your own role" });
  }

  const newRole = target.role === "admin" ? "user" : "admin";
  target.role = newRole;
  await target.save();

  res.json({
    message: `${target.username} is now ${newRole}`,
    user: target,
  });
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });

  const fileCount = await UploadHistory.countDocuments({ user: user._id });

  res.json({
    user: {
      _id: user._id,
      username: user.username,
      useremail: user.useremail,
      role: user.role,
      createdAt: user.createdAt,
      fileCount,
    },
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  // Self-delete prevention — admin khud ko delete na kare 😄
  if (user._id.toString() === req.user.id) {
    return res.status(400).json({ message: "You cannot delete your own account" });
  }

  // Admin protection — role system intact rahe
  if (user.role === "admin") {
    return res.status(400).json({ message: "Cannot delete an admin account" });
  }

  // Files cleanup — DB records + disk dono
  const files = await UploadHistory.find({ user: user._id });
  files.forEach((f) => {
    if (f.storedName) fs.unlink(path.join(UPLOADS_DIR, f.storedName), () => {});
  });
  await UploadHistory.deleteMany({ user: user._id });

  await user.deleteOne();
  res.json({ message: "User and their files deleted" });
});

export const toggleBlockUser = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  const { status } = req.body;
  if (!["active", "blocked"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  // Self-block prevention
  if (user._id.toString() === req.user.id) {
    return res.status(400).json({ message: "You cannot block your own account" });
  }

  // Admin block prevention — admins ko block nahi karenge
  if (user.role === "admin") {
    return res.status(400).json({ message: "Cannot block an admin account" });
  }

  user.status = status;
  await user.save();

  const userObj = user.toObject();
  delete userObj.password;

  res.json({
    message: `User ${status === "blocked" ? "blocked" : "unblocked"} successfully`,
    user: userObj,
  });
});

export const bulkDeleteFiles = asyncHandler(async (req, res) => {
  const { fileIds } = req.body;

  if (!Array.isArray(fileIds) || fileIds.length === 0) {
    return res.status(400).json({ message: 'No files selected' });
  }
  if (fileIds.length > 50) {
    return res.status(400).json({ message: 'Cannot delete more than 50 files at once' });
  }

  // Sirf existing files — invalid ids skip, error nahi
  const files = await UploadHistory.find({ _id: { $in: fileIds } });

  files.forEach((f) => {
    if (f.storedName) fs.unlink(path.join(UPLOADS_DIR, f.storedName), () => {});
  });

  const result = await UploadHistory.deleteMany({ _id: { $in: fileIds } });

  res.json({
    message: `${result.deletedCount} file${result.deletedCount !== 1 ? 's' : ''} deleted`,
    deletedCount: result.deletedCount,
  });
});
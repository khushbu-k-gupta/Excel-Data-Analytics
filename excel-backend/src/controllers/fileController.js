import path from 'path';
import fs from 'fs';
import asyncHandler from '../utils/asyncHandler.js';
import UploadHistory from '../models/UploadHistory.js';
import User from '../models/User.js'; 

const UPLOADS_DIR = path.resolve('uploads');

export const uploadExcel = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Invalid file format' });
  console.log(req.file)
  const history = await UploadHistory.create({
    fileName: req.file.originalname,
    storedName: req.file.filename,
    fileSize: req.file.size,
    user: req.user.id,
  });

  res.status(201).json({ message: 'File uploaded', file: history });
});

export const downloadFile = asyncHandler(async (req, res) => {
  const history = await UploadHistory.findById(req.params.id);
  if (!history) return res.status(404).json({ message: 'File not found' });

  if (req.user.role !== 'admin' && history.user.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Access denied' });
  }

  const filePath = path.join(UPLOADS_DIR, history.storedName);

  if (!filePath.startsWith(UPLOADS_DIR) || !fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'File not found' });
  }

  res.download(filePath, history.fileName); 
});

export const deleteFile = asyncHandler(async (req, res) => {
  const history = await UploadHistory.findById(req.params.id);
  if (!history) return res.status(404).json({ message: 'Upload not found' });

  if (req.user.role !== 'admin' && history.user.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  if (history.storedName) {
    fs.unlink(path.join(UPLOADS_DIR, history.storedName), () => {}); // fire & forget
  }

  await history.deleteOne();
  res.json({ message: 'File deleted' });
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No image provided' });

  const avatarUrl = `/uploads/avatars/${req.file.filename}`;
  await User.findByIdAndUpdate(req.user.id, { avatar: avatarUrl });

  res.json({ message: 'Avatar updated', avatarUrl });
});

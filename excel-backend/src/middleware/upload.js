import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

// Folders ensure karo — warna multer destination na milne pe crash karta hai
fs.mkdirSync('uploads', { recursive: true });
fs.mkdirSync('uploads/avatars', { recursive: true });

// ---------- Excel/CSV upload ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const unique = crypto.randomBytes(8).toString('hex');
    cb(null, `${Date.now()}-${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const ok = ['.xlsx', '.csv'].includes(path.extname(file.originalname).toLowerCase());
    cb(ok ? null : new Error('Only .xlsx and .csv files are allowed'), ok);
  },
});

// ---------- Avatar upload ----------
const avatarUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/avatars/'),
    filename: (req, file, cb) =>
      cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${path.extname(file.originalname)}`),
  }),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const ok = ['.jpg', '.jpeg', '.png', '.webp'].includes(
      path.extname(file.originalname).toLowerCase()
    );
    cb(ok ? null : new Error('Only images allowed'), ok);
  },
});

export default upload;
export { avatarUpload };
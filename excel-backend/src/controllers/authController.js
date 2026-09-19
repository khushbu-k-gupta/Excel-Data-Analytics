import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

dotenv.config();

export const register = async (req, res) => {
  const { username, useremail, password } = req.body;

  if (!username || !useremail || !password) {
    return res
      .status(400)
      .json({ error: "Username, email, and password are required" });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      useremail,
      password: hashed,
      role: "user",
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.status(201).json({
      message: "User registered",
      token,
      role: user.role,
      username: user.username,
      useremail: user.useremail,
      id: user._id,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ error: "Username or email already exists" });
    }
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const login = async (req, res) => {
  const { username, email, password } = req.body;
  const identifier = username || email;

  if (!identifier || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({
      $or: [{ username: identifier }, { useremail: identifier }],
    });

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });
    if (user.status === "blocked") {
      return res
        .status(403)
        .json({ message: "Account suspended. Contact support." });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.json({ token, role: user.role, username: user.username, id: user._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({
      name: user.username,
      email: user.useremail,
      role: user.role || "user",
      avatar: user.avatar || null, // 🆕
      createdAt: user.createdAt, // 🆕 member since
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  const { username, useremail } = req.body;

  if (!username || !useremail) {
    return res.status(400).json({ message: "Username and email are required" });
  }

  try {
    const existingUser = await User.findOne({
      useremail,
      _id: { $ne: req.user.id },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.username = username;
    user.useremail = useremail;

    await user.save();

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const changePassword = async (req, res) => {
  const { oldpassword: oldPassword, newpassword: newPassword } = req.body;

  if (!oldPassword || !newPassword)
    return res.status(400).json({ message: "Old and new password required" });

  if (newPassword.length < 6)
    return res
      .status(400)
      .json({ message: "New password must be at least 6 characters" });

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Current password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

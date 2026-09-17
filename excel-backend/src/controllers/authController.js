import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

export const register = async (req, res) => {
  const { username, useremail, password, role } = req.body;

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
      role,
    });

    res.status(201).json({
      message: "User registered",
      user: {
        id: user._id,
        username: user.username,
        useremail: user.useremail,
        role: user.role,
      },
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
  const { username, password } = req.body;

  try {
    const user = await User.findOne({
      $or: [{ username }, { useremail: username }],
    });

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      role: user.role,
      username: user.username,
      useremail: user.useremail,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({
      name: user.username,
      email: user.useremail,
      role: user.role || "User",
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
  console.log(oldPassword, newPassword);

  if (!oldPassword || !newPassword)
    return res.status(400).json({ message: "Old and new password required" });


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

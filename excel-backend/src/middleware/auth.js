import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from "../models/User.js";
dotenv.config();

// export const verifyToken = (allowedRoles = []) => {
//   return (req, res, next) => {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return res.status(403).json({ error: 'No token provided or malformed' });
//     }

//     const token = authHeader.split(' ')[1];

//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
//       if (allowedRoles.length && !allowedRoles.includes(decoded.role)) {
//         return res.status(403).json({ error: 'Access denied: insufficient role' });
//       }

//       req.user = decoded; 
//       next();
//     } catch (err) {
//       return res.status(401).json({ error: 'Invalid or expired token' });
//     }
//   };
// };


export const verifyToken = (allowedRoles = []) => {
  return async (req, res, next) => {        // ← async yahan
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
      }

      const token = authHeader.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 🆕 DB check — user exist + blocked nahi
      const user = await User.findById(decoded.id).select("role status");
      if (!user) {
        return res.status(401).json({ message: "User no longer exists" });
      }
      if (user.status === "blocked") {
        return res.status(403).json({ message: "Account suspended" });
      }

      // Fresh role — DB se (token wala stale ho sakta hai!)
      req.user = { id: decoded.id, role: user.role };

      // Role check — ab DB wali fresh role se
      if (allowedRoles.length && !allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      next();
    } catch (err) {
      if (err.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Invalid token" });
      }
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" });
      }
      return res.status(500).json({ message: "Server error" });
    }
  };
};

export const isAdmin = (req, res, next) => {
  console.log('isAdmin called with req.user:', req.user);
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized: No user info' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admin only' });
  }
  next();
};
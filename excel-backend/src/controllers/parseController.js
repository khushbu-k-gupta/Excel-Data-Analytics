import path from "path";
import fs from "fs";
import asyncHandler from "../utils/asyncHandler.js";
import UploadHistory from "../models/UploadHistory.js";
import { parseWorkbook } from "../services/excelService.js";

const UPLOADS_DIR = path.resolve("uploads");
const MAX_ROWS_SENT = 500; 

export const parseExcel = asyncHandler(async (req, res) => {
  const history = await UploadHistory.findById(req.params.id);
  if (!history) return res.status(404).json({ message: "File not found" });

  // Ownership
  if (req.user.role !== "admin" && history.user.toString() !== req.user.id) {
    return res.status(403).json({ message: "Access denied" });
  }

  const filePath = path.join(UPLOADS_DIR, history.storedName);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "File not found on server" });
  }

  const { headers, rows, columns, totalRows } = parseWorkbook(filePath);

  res.json({
    fileId: history._id,
    fileName: history.fileName,
    headers,
    columns,
    totalRows,
    rows: rows.slice(0, MAX_ROWS_SENT),
    truncated: totalRows > MAX_ROWS_SENT,

    // 🆕 user ka saved chart — Analytics page isse restore karta hai
    savedConfig: {
      x: history.selectedAxes?.x,
      y: history.selectedAxes?.y,
      chartType: history.chartType,
    },
  });
});

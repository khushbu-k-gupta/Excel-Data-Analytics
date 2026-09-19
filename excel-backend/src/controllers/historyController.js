import asyncHandler from '../utils/asyncHandler.js';
import UploadHistory from '../models/UploadHistory.js';
import path from 'path';
import fs from 'fs';
import { buildChartSummary } from '../services/excelService.js';

const UPLOADS_DIR = path.resolve('uploads');

export const getUserUploads = asyncHandler(async (req, res) => {
  const uploads = await UploadHistory.find({ user: req.user.id }).sort({ uploadDate: -1 });
  res.json(uploads);
});

export const getHistoryById = asyncHandler(async (req, res) => {
  const history = await UploadHistory.findById(req.params.id);
  if (!history) return res.status(404).json({ message: 'History not found' });

  if (req.user.role !== 'admin' && history.user.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Access denied' });
  }

  res.json(history);
});

export const updateChartHistory = asyncHandler(async (req, res) => {
  const { xAxis, yAxis, chartType, chartDownloadUrl } = req.body;

  if (!xAxis || !yAxis || !chartType) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const history = await UploadHistory.findById(req.params.id);
  if (!history) return res.status(404).json({ message: 'History not found' });

  if (req.user.role !== 'admin' && history.user.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Access denied' });
  }

  history.selectedAxes = { x: xAxis, y: yAxis };
  history.chartType = chartType;
  history.chartDownloadUrl = chartDownloadUrl || '';
  await history.save();

  res.json({ message: 'Chart info updated', history });
});

export const getStats = asyncHandler(async (req, res) => {
  const stats = await UploadHistory.aggregate([
    { $match: { user: req.user.id } },
    { $group: { _id: '$chartType', count: { $sum: 1 } } },
  ]);
  res.json({ chartStats: stats });
});

export const getChartGallery = asyncHandler(async (req, res) => {
  // Sirf saved charts — chartType "-" default hai, skip those
  const files = await UploadHistory.find({
    user: req.user.id,
    chartType: { $ne: '-' },
  }).sort({ uploadDate: -1 });

  const charts = files
    .map((f) => {
      if (!f.selectedAxes || f.selectedAxes.x === '-' || f.selectedAxes.y === '-') return null;

      const filePath = path.join(UPLOADS_DIR, f.storedName);
      if (!fs.existsSync(filePath)) return null; // disk pe file gayab (render restart) — skip, crash nahi

      try {
        const data = buildChartSummary(filePath, {
          x: f.selectedAxes.x,
          y: f.selectedAxes.y,
          chartType: f.chartType,
        });
        return {
          id: f._id,
          fileName: f.fileName,
          chartType: f.chartType,
          axes: f.selectedAxes,
          data,
          savedAt: f.uploadDate,
        };
      } catch {
        return null; // corrupt file — poora page fail mat karo
      }
    })
    .filter(Boolean);

  res.json({ charts });
});
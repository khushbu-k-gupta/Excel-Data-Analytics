import mongoose from "mongoose";

const uploadHistorySchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  selectedAxes: {
    x: { type: String, default: "-" },
    y: { type: String, default: "-" },
  },
  chartType: { type: String, enum: ["bar", "line", "pie", "-"], default: "-" },
  chartDownloadUrl: { type: String, default: "" },
  storedName: { type: String, required: true },
  fileSize: { type: Number, default: 0 },
});

export default mongoose.model("UploadHistory", uploadHistorySchema);

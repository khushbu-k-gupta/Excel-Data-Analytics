import api from "./axios";

// Backend fields → frontend fields — mapping EK jagah
const mapFile = (f) => ({
  _id: f._id,
  name: f.fileName,
  size: f.fileSize,
  uploadedAt: f.uploadDate,
  chartType: f.chartType,
  storedName: f.storedName,
});

export const excelApi = {
  upload: (formData, config) =>
    api.post("/files/upload", formData, {
      ...config,
      headers: { "Content-Type": "multipart/form-data" },
    }),
  uploadAvatar: (formData, config) =>
    api.post("/files/avatar", formData, {
      ...config,
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getFiles: async () => {
    const { data } = await api.get("/history");
    console.log(data)
    const list = Array.isArray(data) ? data : data.files || [];
    return { data: list.map(mapFile) }; 
  },

  deleteFile: (id) => api.delete(`/files/${id}`),

  getAnalytics: (fileId) => api.get(`/data/${fileId}`), // ✅ sahi path
  updateChart: (fileId, data) => api.put(`/history/${fileId}/chart`, data),
  getChartGallery: () => api.get("/history/charts/gallery"), // Charts page ke liye
  // 🆕 Download — blob response chahiye, JSON nahi!
downloadFile: async (fileId) => {
  const response = await api.get(`/files/${fileId}/download`, {
    responseType: 'blob',  // ⭐ binary data — ye sab kuch hai
  });
  return response;
},
};

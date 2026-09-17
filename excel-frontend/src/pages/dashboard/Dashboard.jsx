import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FiPlus, FiSearch, FiFileText, FiAlertCircle } from "react-icons/fi";
import { excelApi } from "../../api/excel.api";
import { useAuth } from "../../hooks/useAuth";
import FileCard from "../../components/ui/FileCard";
import EmptyState from "../../components/ui/EmptyState";
import Spinner from "../../components/ui/Spinner";
import UploadModal from "./UploadModal";
import { useNavigate } from "react-router-dom"; // import add karo

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await excelApi.getFiles();
      setFiles(data.files || data);
      setError("");
    } catch (err) {
      setError("Could not load your files. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleDelete = async (file) => {
    // Native confirm se better: file name ke saath — accidental delete se bacho
    if (!window.confirm(`Delete "${file.name}"? This cannot be undone.`))
      return;

    try {
      setDeletingId(file._id);
      await excelApi.deleteFile(file._id);

      // Optimistic UI — turant list se hatao, refetch ki zaroorat nahi
      setFiles((prev) => prev.filter((f) => f._id !== file._id));
    } catch {
      alert("Failed to delete. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  // Search filter — useMemo, har render pe filter na ho
  const filteredFiles = useMemo(
    () =>
      files?.filter((f) =>
        f.name?.toLowerCase().includes(search.toLowerCase()),
      ),
    [files, search],
  );

  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <div className="min-h-screen bg-[#0b0d12] pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
              Welcome back,{" "}
              <span className="text-emerald-400">{firstName}</span> 👋
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {files.length === 0
                ? "Upload your first file to get started."
                : `You have ${files.length} file${files.length > 1 ? "s" : ""} analyzed.`}
            </p>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="btn-accent flex items-center gap-2 w-fit"
          >
            <FiPlus size={18} /> Upload File
          </button>
        </div>

        {/* Search — files > 4 hone pe dikhao (jab kaam ho tab hi UI dikhao) */}
        {files.length > 4 && (
          <div className="relative mt-8 max-w-md">
            <FiSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              size={16}
            />
            <input
              type="text"
              placeholder="Search files..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-dark pl-11"
            />
          </div>
        )}

        {/* Content */}
        <div className="mt-8">
          {loading ? (
            <Spinner size="lg" />
          ) : error ? (
            <div className="card flex flex-col items-center py-14 px-6 text-center">
              <FiAlertCircle size={36} className="text-red-400" />
              <p className="text-sm text-slate-300 mt-4">{error}</p>
              <button onClick={fetchFiles} className="btn-ghost mt-5">
                Retry
              </button>
            </div>
          ) : filteredFiles.length === 0 ? (
            search ? (
              <EmptyState
                icon={FiSearch}
                title="No files found"
                desc={`Nothing matches "${search}". Try a different name.`}
              />
            ) : (
              <EmptyState
                icon={FiFileText}
                title="No files yet"
                desc="Upload your first Excel or CSV file and watch it turn into interactive charts."
                action={
                  <button
                    onClick={() => setShowUpload(true)}
                    className="btn-accent flex items-center gap-2 mx-auto"
                  >
                    <FiPlus size={16} /> Upload your first file
                  </button>
                }
              />
            )
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredFiles.map((file) => (
                <FileCard
                  key={file._id}
                  file={file}
                  onDelete={handleDelete}
                  deleting={deletingId === file._id}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUploadSuccess={(file) => {
            if (file?._id) {
              navigate(`/analytics/${file._id}`); // 🚀 seedha analysis pe!
            } else {
              fetchFiles(); // fallback — file nahi mila toh list refresh
              setShowUpload(false);
            }
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;

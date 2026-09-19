import React, { useRef, useState, useEffect } from "react";
import { FiX, FiUploadCloud, FiCheckCircle } from "react-icons/fi";
import { excelApi } from "../../api/excel.api";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

const UploadModal = ({ onClose, onUploadSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef(null);

  const validate = (selected) => {
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "text/csv", // .csv
    ];
    if (
      !validTypes.includes(selected.type) &&
      !/\.(xlsx|csv)$/i.test(selected.name)
    ) {
      return "Only .xlsx or .csv files are supported.";
    }
    if (selected.size > MAX_SIZE) {
      return "File too large. Maximum size is 10MB.";
    }
    return null;
  };

  const handleFile = (selected) => {
    const err = validate(selected);
    if (err) return setError(err);
    setError("");
    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      setError("");

      const { data } = await excelApi.upload(formData, {
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded / e.total) * 100);
          setProgress(pct);
        },
      });

      setSuccess(true);
      setTimeout(() => onUploadSuccess(data?.file), 1200); // ✅ file object pass karo
    } catch (err) {
      setError(
        err.response?.data?.message || "Upload failed. Please try again.",
      );
      setUploading(false);
    }
  };

  // Escape key se close
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && !uploading && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [uploading, onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => !uploading && onClose()}
      />

      {/* Modal */}
      <div className="card relative w-full max-w-md p-6 animate-fade-up">
        <button
          onClick={onClose}
          disabled={uploading}
          className="absolute right-4 top-4 text-slate-500 hover:text-white transition disabled:opacity-40"
          aria-label="Close"
        >
          <FiX size={20} />
        </button>

        <h2 className="font-display text-xl font-semibold">Upload your file</h2>
        <p className="text-sm text-slate-400 mt-1">
          Excel (.xlsx) or CSV — up to 10MB
        </p>

        {success ? (
          /* -------- Success state -------- */
          <div className="py-10 flex flex-col items-center text-center">
            <FiCheckCircle size={48} className="text-emerald-400" />
            <p className="font-medium mt-4">Upload complete!</p>
            <p className="text-sm text-slate-400 mt-1">Loading your files...</p>
          </div>
        ) : (
          <>
            {/* -------- Dropzone -------- */}
            <div
              onClick={() => !uploading && inputRef.current?.click()}
              onDragEnter={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setDragActive(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                if (!uploading) handleFile(e.dataTransfer.files[0]);
              }}
              className={`
                mt-6 flex flex-col items-center justify-center py-10 px-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200
                ${
                  dragActive
                    ? "border-emerald-400 bg-emerald-500/[0.07] scale-[1.01]"
                    : "border-white/[0.12] bg-white/[0.02] hover:border-emerald-500/40 hover:bg-emerald-500/[0.03]"
                }
                ${uploading ? "pointer-events-none" : ""}
              `}
            >
              <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <FiUploadCloud size={22} />
              </span>

              {file ? (
                <div className="mt-4 text-center">
                  <p className="text-sm font-medium text-white truncate max-w-[240px]">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {(file.size / 1024).toFixed(1)} KB — click to change
                  </p>
                </div>
              ) : (
                <div className="mt-4 text-center">
                  <p className="text-sm text-slate-300">
                    Drag & drop here, or{" "}
                    <span className="text-emerald-400 font-medium">browse</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Your file never leaves your account
                  </p>
                </div>
              )}

              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.csv"
                className="hidden"
                onChange={(e) =>
                  e.target.files[0] && handleFile(e.target.files[0])
                }
              />
            </div>

            {/* Progress */}
            {uploading && (
              <div className="mt-5">
                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                  <span>Uploading {file?.name}...</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-700/50 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/[0.07] px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="btn-accent w-full mt-6 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              {uploading ? `Uploading... ${progress}%` : "Upload & Analyze"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default UploadModal;

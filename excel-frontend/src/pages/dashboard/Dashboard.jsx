import { triggerDownload } from "../../utils/download";
import { useState, useEffect, useCallback, useMemo } from "react";
import { FiPlus, FiSearch, FiFileText, FiAlertCircle } from "react-icons/fi";
import { excelApi } from "../../api/excel.api";
import { useAuth } from "../../hooks/useAuth";
import FileCard from "../../components/ui/FileCard";
import EmptyState from "../../components/ui/EmptyState";
import Spinner from "../../components/ui/Spinner";
import UploadModal from "./UploadModal";
import { useNavigate } from "react-router-dom";
import { FiX, FiSliders } from "react-icons/fi";
const CHART_FILTERS = [
  { id: "all", label: "All" },
  { id: "bar", label: "Bar" },
  { id: "line", label: "Line" },
  { id: "pie", label: "Pie" },
  { id: "unsaved", label: "Unsaved" },
];

const SORTS = [
  { id: "newest", label: "Newest first" },
  { id: "oldest", label: "Oldest first" },
  { id: "name", label: "Name (A-Z)" },
  { id: "size", label: "Largest size" },
];
const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  // 🆕 purana search state hata ke ye lo
  const [search, setSearch] = useState("");
  const [chartFilter, setChartFilter] = useState("all"); // all | bar | line | pie | unsaved
  const [sortBy, setSortBy] = useState("newest"); // newest | oldest | name | size

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

  // ================= FILTER + SORT =================
  const filteredFiles = useMemo(() => {
    let result = [...files];

    // ---- Search ----
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((f) => f.name?.toLowerCase().includes(q));
    }

    // ---- Chart type ----
    if (chartFilter !== "all") {
      result =
        chartFilter === "unsaved"
          ? result.filter((f) => !f.chartType || f.chartType === "-")
          : result.filter((f) => f.chartType === chartFilter);
    }

    // ---- Sort ----
    switch (sortBy) {
      case "oldest":
        result.sort((a, b) => new Date(a.uploadedAt) - new Date(b.uploadedAt));
        break;
      case "name":
        result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "size":
        result.sort((a, b) => (b.size || 0) - (a.size || 0));
        break;
      default: // newest
        result.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    }

    return result;
  }, [files, search, chartFilter, sortBy]);

  const hasActiveFilters =
    search.trim() !== "" || chartFilter !== "all" || sortBy !== "newest";

  const clearFilters = () => {
    setSearch("");
    setChartFilter("all");
    setSortBy("newest");
  };

  const handleDownload = async (file) => {
    try {
      setDownloadingId(file._id);
      const response = await excelApi.downloadFile(file._id);
      triggerDownload(response.data, file.name);
    } catch {
      alert("Download failed. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };
  const handleDelete = async (file) => {
    if (!window.confirm(`Delete "${file.name}"? This cannot be undone.`))
      return;

    try {
      setDeletingId(file._id);
      await excelApi.deleteFile(file._id);

      setFiles((prev) => prev.filter((f) => f._id !== file._id));
    } catch {
      alert("Failed to delete. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  // const filteredFiles = useMemo(
  //   () =>
  //     files?.filter((f) =>
  //       f.name?.toLowerCase().includes(search.toLowerCase()),
  //     ),
  //   [files, search],
  // );

  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <div className="min-h-screen bg-[#0b0d12] pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* ===== FILTER BAR — files > 0 pe dikhe ===== */}
        {!loading && files.length > 0 && (
          <div className="card mb-4  p-4 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between animate-fade-up">
            {/* Search */}
            <div className="relative flex-1 lg:max-w-xs">
              <FiSearch
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                size={15}
              />
              <input
                type="text"
                placeholder="Search files..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-dark pl-10 pr-9"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  aria-label="Clear search"
                >
                  <FiX size={14} />
                </button>
              )}
            </div>

            {/* Chart type chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <FiSliders size={13} className="text-slate-500 mr-1" />
              {CHART_FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setChartFilter(f.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    chartFilter === f.id
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : "text-slate-400 border border-white/[0.08] hover:bg-white/[0.04]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Right side — sort + clear */}
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-dark w-auto py-2 pr-8 [&>option]:bg-[#12151c]"
                aria-label="Sort files"
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Clear all filters"
                >
                  <FiX size={13} /> Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* Count line — filters active pe */}
        {!loading && hasActiveFilters && files.length > 0 && (
          <p className="text-xs text-slate-500 mt-3">
            Showing {filteredFiles.length} of {files.length} files
          </p>
        )}
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
            hasActiveFilters ? (
              // Case 1: Filters ne sab chhupa diya
              <EmptyState
                icon={FiSearch}
                title="No matching files"
                desc="No files match your search or filters."
                action={
                  <button
                    onClick={clearFilters}
                    className="btn-ghost mx-auto flex items-center gap-2"
                  >
                    <FiX size={14} /> Clear filters
                  </button>
                }
              />
            ) : (
              // Case 2: Genuinely koi file nahi
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
                  onDownload={handleDownload} // 🆕
                  downloading={downloadingId === file._id}
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

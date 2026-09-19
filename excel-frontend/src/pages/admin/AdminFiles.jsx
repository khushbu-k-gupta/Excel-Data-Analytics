import { useState, useEffect, useCallback } from "react";
import { FiTrash2, FiFolder } from "react-icons/fi";
import api from "../../api/axios";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import { formatDate, formatFileSize } from "../../utils/formatters";
import Pagination from "../../components/ui/Pagination";

const AdminFiles = () => {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [selected, setSelected] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchUploads = useCallback(async (p = 1) => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/uploads", {
        params: { page: p, limit: 10 }, 
      });

      setUploads(data.uploads);
      setTotal(data.total); 
    } catch {
      setUploads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUploads(page);
  }, [page, fetchUploads]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    setSelected([]); 
  };

  const handleDelete = async (file) => {
    if (!window.confirm(`Delete "${file.fileName}"?`)) return;
    try {
      setDeletingId(file._id);
      await api.delete(`/files/${file._id}`);
      setUploads((prev) => prev.filter((f) => f._id !== file._id));
    } catch {
      alert("Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  const toggleSelect = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );

  const allSelected = uploads.length > 0 && selected.length === uploads.length;

  const toggleSelectAll = () =>
    setSelected(allSelected ? [] : uploads.map((f) => f._id));

  const handleBulkDelete = async () => {
    if (
      !window.confirm(
        `Delete ${selected.length} file${selected.length !== 1 ? "s" : ""}? This cannot be undone.`,
      )
    )
      return;

    try {
      setBulkDeleting(true);
      await api.post("/admin/files/bulk-delete", { fileIds: selected });
      setUploads((prev) => prev.filter((f) => !selected.includes(f._id)));
      setSelected([]);
    } catch (err) {
      alert(err.response?.data?.message || "Bulk delete failed");
    } finally {
      setBulkDeleting(false);
    }
  };
  return (
    <div>
      <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
        All Files
      </h1>

      <p className="text-sm text-slate-400 mt-1">
        {total} file{total !== 1 && "s"} across all users
      </p>
      <div className="card mt-6 overflow-hidden">
        {loading ? (
          <Spinner />
        ) : uploads.length === 0 ? (
          <div className="py-6">
            <EmptyState
              icon={FiFolder}
              title="No files"
              desc="No uploads yet across the platform."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-xs text-slate-500">
                  <th className="w-10 px-5 py-3.5">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 accent-emerald-500 cursor-pointer"
                    />
                  </th>

                  {/* Har row mein — File name se pehle: */}

                  <th className="text-left px-5 py-3.5 font-medium">File</th>
                  <th className="text-left px-5 py-3.5 font-medium">Owner</th>
                  <th className="text-left px-5 py-3.5 font-medium">Size</th>
                  <th className="text-left px-5 py-3.5 font-medium">
                    Uploaded
                  </th>
                  <th className="text-right px-5 py-3.5 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {uploads.map((f) => (
                  <tr
                    key={f._id}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-3.5">
                      <input
                        type="checkbox"
                        checked={selected.includes(f._id)}
                        onChange={() => toggleSelect(f._id)}
                        className="w-4 h-4 accent-emerald-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-5 py-3.5 text-slate-300">{f.fileName}</td>
                    <td className="px-5 py-3.5 text-slate-400">
                      {f.user?.username || "—"}
                      <span className="block text-[11px] text-slate-500">
                        {f.user?.useremail || ""}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">
                      {formatFileSize(f.fileSize)}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">
                      {formatDate(f.uploadDate)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleDelete(f)}
                        disabled={deletingId === f._id}
                        className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg p-2 transition-colors disabled:opacity-50"
                        aria-label="Delete file"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination se PEHLE, card ke andar */}
            {selected.length > 0 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06] bg-emerald-500/[0.03] animate-fade-up">
                <p className="text-sm text-slate-300">
                  {selected.length} selected
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelected([])}
                    className="btn-ghost px-3 py-1.5 text-xs"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    disabled={bulkDeleting}
                    className="flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-1.5 text-xs font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
                  >
                    <FiTrash2 size={13} />
                    {bulkDeleting
                      ? "Deleting..."
                      : `Delete ${selected.length} file${selected.length !== 1 ? "s" : ""}`}
                  </button>
                </div>
              </div>
            )}
            <Pagination
              page={page}
              total={total}
              limit={10}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFiles;

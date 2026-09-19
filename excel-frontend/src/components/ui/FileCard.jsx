import React from "react";
import { Link } from "react-router-dom";
import {
  FiBarChart2,
  FiTrash2,
  FiFileText,
  FiCalendar,
  FiDownload,
} from "react-icons/fi";
import { formatDate, formatFileSize } from "../../utils/formatters";

const FileCard = ({ file, onDelete, deleting, onDownload, downloading }) => {
  return (
    <div className="card p-5 group relative hover:border-emerald-500/30 transition-all duration-300">
      <div className="flex items-start justify-between gap-3">
        <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
          <FiFileText size={18} />
        </span>

        {/* Delete */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => onDownload(file)}
            disabled={downloading}
            className="text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg p-1.5 transition-colors disabled:opacity-50"
            aria-label="Download file"
            title="Download"
          >
            <FiDownload size={16} />
          </button>
          <button
            onClick={() => onDelete(file)}
            disabled={deleting}
            className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg p-1.5 transition-colors disabled:opacity-50"
            aria-label="Delete file"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      </div>

      <h3 className="font-medium mt-4 truncate" title={file.name}>
        {file.name}
      </h3>

      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <FiCalendar size={12} /> {formatDate(file.uploadedAt)}
        </span>
        <span>{formatFileSize(file.size)}</span>
      </div>

      {file.rows != null && (
        <div className="mt-3 flex gap-2 text-[11px]">
          <span className="px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-slate-400">
            {file.rows.toLocaleString()} rows
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-slate-400">
            {file.columns} cols
          </span>
        </div>
      )}

      <Link
        to={`/analytics/${file._id}`}
        className="mt-5 flex items-center justify-center gap-2 w-full rounded-xl bg-white/[0.04] border border-white/[0.06] py-2.5 text-sm text-slate-300
                   hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400 transition-all"
      >
        <FiBarChart2 size={15} /> View Analytics
      </Link>
    </div>
  );
};

export default FileCard;


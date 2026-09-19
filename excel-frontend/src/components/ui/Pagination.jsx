const Pagination = ({ page, total, limit = 10, onPageChange }) => {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-5 py-4 border-t border-white/[0.06]">
      <p className="text-xs text-slate-500">Page {page} of {totalPages} — {total} total</p>
      <div className="flex gap-2">
        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="btn-ghost px-3 py-1.5 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ← Prev
        </button>
        <button
          disabled={page * limit >= total}
          onClick={() => onPageChange(page + 1)}
          className="btn-ghost px-3 py-1.5 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default Pagination;
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiTrash2, FiEye, FiMail, FiCalendar, FiFileText, FiShield, FiUser } from 'react-icons/fi';
import api from '../../api/axios';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { formatDate, formatFileSize } from '../../utils/formatters';

const AdminUserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [userRes, uploadsRes] = await Promise.all([
          api.get(`/admin/users/${id}`),
          api.get(`/admin/users/${id}/uploads`),
        ]);
        setUser(userRes.data.user);
        setUploads(uploadsRes.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleDeleteFile = async (file) => {
    if (!window.confirm(`Delete "${file.fileName}"?`)) return;
    try {
      setDeletingId(file._id);
      await api.delete(`/files/${file._id}`);
      setUploads((prev) => prev.filter((f) => f._id !== file._id));
    } catch {
      alert('Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <Spinner size="lg" />;

  if (!user) {
    return (
      <EmptyState
        icon={FiUser}
        title="User not found"
        desc="This user may have been deleted."
        action={<Link to="/admin/users" className="btn-accent mx-auto">Back to Users</Link>}
      />
    );
  }
// if (req.user.role !== 'admin' && history.user.toString() !== req.user.id)
  return (
    <div>
      {/* Back */}
      <button
        onClick={() => navigate('/admin/users')}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 transition w-fit"
      >
        <FiArrowLeft size={15} /> Back to users
      </button>

      {/* Profile card */}
      <div className="card mt-6 p-6 flex flex-col sm:flex-row sm:items-center gap-6">
        <span className="flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-2xl font-bold uppercase shrink-0">
          {user.username?.charAt(0) || '?'}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold truncate">{user.username}</h1>
            {user.role === 'admin' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px]">
                <FiShield size={10} /> admin
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-slate-400 text-[11px]">user</span>
            )}
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3 text-sm text-slate-400">
            <span className="flex items-center gap-1.5"><FiMail size={13} /> {user.useremail}</span>
            <span className="flex items-center gap-1.5"><FiCalendar size={13} /> Joined {formatDate(user.createdAt)}</span>
            <span className="flex items-center gap-1.5"><FiFileText size={13} /> {user.fileCount} files</span>
          </div>
        </div>
      </div>

      {/* Files table */}
      <div className="card mt-6 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <h3 className="text-sm font-semibold">Uploaded Files ({uploads.length})</h3>
        </div>

        {uploads.length === 0 ? (
          <div className="py-6">
            <EmptyState icon={FiFileText} title="No files" desc="This user hasn't uploaded anything yet." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-xs text-slate-500">
                  <th className="text-left px-5 py-3.5 font-medium">File</th>
                  <th className="text-left px-5 py-3.5 font-medium">Size</th>
                  <th className="text-left px-5 py-3.5 font-medium">Uploaded</th>
                  <th className="text-right px-5 py-3.5 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {uploads.map((f) => (
                  <tr key={f._id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="px-5 py-3.5 text-slate-300">{f.fileName}</td>
                    <td className="px-5 py-3.5 text-slate-400">{formatFileSize(f.fileSize)}</td>
                    <td className="px-5 py-3.5 text-slate-400">{formatDate(f.uploadDate)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => navigate(`/analytics/${f._id}`)}
                        className="text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg p-2 transition-colors"
                        title="View analytics"
                      >
                        <FiEye size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteFile(f)}
                        disabled={deletingId === f._id}
                        className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg p-2 transition-colors disabled:opacity-50"
                        title="Delete file"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserDetail;
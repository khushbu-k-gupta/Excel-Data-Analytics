import React, { useState, useEffect, useCallback } from "react";
import {
  FiSearch,
  FiTrash2,
  FiShield,
  FiUser,
  FiDownload,
  FiCheckCircle,
  FiSlash,
} from "react-icons/fi";
import api from "../../api/axios";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import { FiArrowUpCircle, FiArrowDownCircle } from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import { Link } from "react-router-dom";
import Pagination from "../../components/ui/Pagination";
import { exportCsv } from "../../utils/exportCsv";
const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);
  const [blockingId, setBlockingId] = useState(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [page, setPage] = useState(1);
  const { user } = useAuth();
  const currentUserId = user?.id;

  const fetchUsers = useCallback(async (q = "", silent = false) => {
    try {
      if (!silent) setLoading(true);
      const { data } = await api.get("/admin/users", {
        params: { search: q, page, limit: 10 },
      });
      setUsers(data.users);
      setTotal(data.total);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchUsers(search, true), 300);
    return () => clearTimeout(t);
  }, [search, page, fetchUsers]);

  const handleDelete = async (user) => {
    if (
      !window.confirm(
        `Delete "${user.username}"? Their files will also be deleted.`,
      )
    )
      return;
    try {
      setDeletingId(user._id);
      await api.delete(`/admin/users/${user._id}`);
      setUsers((prev) => prev.filter((u) => u._id !== user._id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  const handleRoleToggle = async (user) => {
    const action =
      user.role === "admin" ? "demote to user" : "promote to admin";
    if (!window.confirm(`${action} for "${user.username}"?`)) return;

    try {
      setUpdatingId(user._id);
      const { data } = await api.patch(`/admin/users/${user._id}/role`);
      setUsers((prev) => prev.map((u) => (u._id === user._id ? data.user : u)));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update role");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleExport = () => {
    exportCsv(
      users.map((u) => ({
        Name: u.username,
        Email: u.useremail,
        Role: u.role,
      })),
      `users-page-${page}.csv`,
    );
  };

  const handleBlockToggle = async (user) => {
    const newStatus = user.status === "blocked" ? "active" : "blocked";
    const action =
      newStatus === "blocked"
        ? `Block "${user.username}"? They won't be able to login.`
        : `Unblock "${user.username}"? They can login again.`;

    if (!window.confirm(action)) return;

    try {
      setBlockingId(user._id);
      const { data } = await api.patch(`/admin/users/${user._id}/status`, {
        status: newStatus,
      });
      setUsers((prev) => prev.map((u) => (u._id === user._id ? data.user : u)));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setBlockingId(null);
    }
  };
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
            Users
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {total} registered user{total !== 1 && "s"}
          </p>
        </div>

        {/* Debounced search */}
        <div className="flex gap-3 items-center">
          <div className="relative sm:w-72">
            <FiSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              size={16}
            />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="input-dark pl-11"
            />
          </div>
          <button
            onClick={handleExport}
            className="btn-ghost flex items-center gap-2 shrink-0"
          >
            <FiDownload size={15} /> CSV
          </button>
        </div>
      </div>

      <div className="card mt-6 overflow-hidden">
        {loading ? (
          <Spinner />
        ) : users.length === 0 ? (
          <div className="py-6">
            <EmptyState
              icon={FiUser}
              title="No users found"
              desc={
                search
                  ? `Nothing matches "${search}".`
                  : "No users have registered yet."
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-xs text-slate-500">
                  <th className="text-left px-5 py-3.5 font-medium">S.No</th>
                  <th className="text-left px-5 py-3.5 font-medium">User</th>
                  <th className="text-left px-5 py-3.5 font-medium">Email</th>
                  <th className="text-left px-5 py-3.5 font-medium">Role</th>
                  <th className="text-left px-5 py-3.5 font-medium">Status</th>
                  <th className="text-right px-5 py-3.5 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u._id}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-3.5">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase">
                        {u.username?.charAt(0) || "?"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-300">
                      <Link
                        to={`/admin/users/${u._id}`}
                        className="hover:text-emerald-400 transition-colors"
                      >
                        {u.username}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">
                      {u.useremail}
                    </td>
                    <td className="px-5 py-3.5">
                      {u.role === "admin" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px]">
                          <FiShield size={10} /> admin
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-slate-400 text-[11px]">
                          user
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {u.status === "blocked" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[11px]">
                          <FiSlash size={10} /> blocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px]">
                          <FiCheckCircle size={10} /> active
                        </span>
                      )}
                    </td>
            
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {u._id !== currentUserId && (
                          <button
                            onClick={() => handleRoleToggle(u)}
                            disabled={updatingId === u._id}
                            className={`rounded-lg p-2 transition-colors disabled:opacity-50 ${
                              u.role === "admin"
                                ? "text-emerald-400 hover:bg-emerald-500/10" // demote (down)
                                : "text-slate-500 hover:bg-emerald-500/10 hover:text-emerald-400" // promote (up)
                            }`}
                            title={
                              u.role === "admin"
                                ? "Demote to user"
                                : "Promote to admin"
                            }
                          >
                            {u.role === "admin" ? (
                              <FiArrowDownCircle size={15} />
                            ) : (
                              <FiArrowUpCircle size={15} />
                            )}
                          </button>
                        )}
                            {u._id !== currentUserId && u.role !== "admin" && (
                          <button
                            onClick={() => handleBlockToggle(u)}
                            disabled={blockingId === u._id}
                            className={`rounded-lg p-2 transition-colors disabled:opacity-50 ${
                              u.status === "blocked"
                                ? "text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10" // unblock
                                : "text-slate-500 hover:text-red-400 hover:bg-red-500/10" // block
                            }`}
                            title={
                              u.status === "blocked"
                                ? "Unblock user"
                                : "Block user"
                            }
                          >
                            {u.status === "blocked" ? (
                              <FiCheckCircle size={15} />
                            ) : (
                              <FiSlash size={15} />
                            )}
                          </button>
                        )}
                        {/* Delete — non-admins only */}
                        {u.role !== "admin" && (
                          <button
                            onClick={() => handleDelete(u)}
                            disabled={deletingId === u._id}
                            className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg p-2 transition-colors disabled:opacity-50"
                            title="Delete user"
                          >
                            <FiTrash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              page={page}
              total={total}
              limit={10}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;

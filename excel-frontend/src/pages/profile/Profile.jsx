import { useState, useRef, useEffect } from "react";
import {
  FiUser,
  FiMail,
  FiCamera,
  FiLock,
  FiCheck,
  FiShield,
  FiCalendar,
  FiUpload,
} from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import { authApi } from "../../api/auth.api";
import { excelApi } from "../../api/excel.api";
import { formatDate } from "../../utils/formatters";
import { API_BASE } from "../../constants";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const avatarInput = useRef(null);

  // ---- Profile form ----
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [profileMsg, setProfileMsg] = useState(null); // { type: 'ok'|'err', text }
  const [savingProfile, setSavingProfile] = useState(false);

  // ---- Password form ----
  const [pwd, setPwd] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwdMsg, setPwdMsg] = useState(null);
  const [savingPwd, setSavingPwd] = useState(false);
  const [memberSince, setMemberSince] = useState(null);

  // ---- Avatar ----
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const inputCls = "input-dark mt-1.5";
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await authApi.getProfile();
        setForm({ name: data.name || "", email: data.email || "" });
        setMemberSince(data.createdAt);
      } catch {
        // silent — form default empty rahega
      }
    };
    load();
  }, []);
  // ================= PROFILE SAVE =================
  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileMsg(null);

    if (!form.name.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) {
      return setProfileMsg({
        type: "err",
        text: "Please enter a valid name and email.",
      });
    }

    try {
      setSavingProfile(true);
      await authApi.updateProfile(form);
      updateUser({ name: form.name }); // 🎯 Navbar + Dashboard greeting turant update
      setProfileMsg({ type: "ok", text: "Profile updated successfully!" });
      setTimeout(() => setProfileMsg(null), 2500);
    } catch (err) {
      setProfileMsg({
        type: "err",
        text: err.response?.data?.message || "Update failed.",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  // ================= PASSWORD CHANGE =================
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwdMsg(null);

    if (!pwd.oldPassword || !pwd.newPassword) {
      return setPwdMsg({ type: "err", text: "Please fill in both passwords." });
    }
    if (pwd.newPassword.length < 6) {
      return setPwdMsg({
        type: "err",
        text: "New password must be at least 6 characters.",
      });
    }
    if (pwd.newPassword !== pwd.confirmPassword) {
      return setPwdMsg({ type: "err", text: "Passwords do not match." });
    }

    try {
      setSavingPwd(true);
      await authApi.changePassword({
        oldPassword: pwd.oldPassword,
        newPassword: pwd.newPassword,
      });
      setPwd({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setPwdMsg({ type: "ok", text: "Password changed successfully!" });
      setTimeout(() => setPwdMsg(null), 2500);
    } catch (err) {
      setPwdMsg({
        type: "err",
        text: err.response?.data?.message || "Password change failed.",
      });
    } finally {
      setSavingPwd(false);
    }
  };

  // ================= AVATAR =================
  const handleAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return setProfileMsg({ type: "err", text: "Image must be under 2MB." });
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadingAvatar(true);
      const { data } = await excelApi.uploadAvatar(formData);
      console.log(data)
      updateUser({ avatar: data.avatarUrl }); // instant preview
      setProfileMsg({ type: "ok", text: "Avatar updated!" });
      setTimeout(() => setProfileMsg(null), 2500);
    } catch (err) {
      setProfileMsg({
        type: "err",
        text: err.response?.data?.message || "Avatar upload failed.",
      });
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  const Message = ({ msg }) =>
    msg ? (
      <div
        className={`rounded-xl border px-4 py-3 text-sm ${
          msg.type === "ok"
            ? "border-emerald-500/20 bg-emerald-500/[0.07] text-emerald-400"
            : "border-red-500/20 bg-red-500/[0.07] text-red-400"
        }`}
      >
        {msg.type === "ok" && <FiCheck size={13} className="inline mr-1.5" />}
        {msg.text}
      </div>
    ) : null;

  const initial = user?.name?.charAt(0)?.toUpperCase() || "?";
  return (
    <div className="min-h-screen bg-[#0b0d12] pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
          Profile
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your account settings.
        </p>

        {/* ============ Avatar card ============ */}
        <div className="card mt-8 p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative shrink-0">
            {user?.avatar ? (
              <img
                 src={`${API_BASE}${user.avatar}`}
                alt="avatar"
                className="w-20 h-20 rounded-2xl object-cover border border-emerald-500/20"
              />
            ) : (
              <span className="flex items-center justify-center w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-display text-3xl font-bold">
                {initial}
              </span>
            )}

            {/* Camera overlay */}
            <button
              onClick={() => avatarInput.current?.click()}
              disabled={uploadingAvatar}
              className="absolute -bottom-1.5 -right-1.5 flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors shadow-lg disabled:opacity-60"
              aria-label="Change photo"
            >
              <FiCamera size={14} />
            </button>

            <input
              ref={avatarInput}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={handleAvatar}
            />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="font-display text-xl font-bold">
                {user?.name || "User"}
              </h2>
              {user?.role === "admin" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px]">
                  <FiShield size={10} /> admin
                </span>
              )}
            </div>
            <p className="text-sm text-slate-400 mt-1">{form.email || user?.email || "—"}</p>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5 justify-center sm:justify-start">
              <FiCalendar size={12} />
              {memberSince
                ? `Member since ${formatDate(memberSince)}`
                : "Loading..."}
            </p>
            <p className="text-[11px] text-slate-500 mt-3">
              JPG, PNG or WebP — max 2MB
            </p>
          </div>
        </div>

        {/* ============ Profile info ============ */}
        <form onSubmit={handleProfileSave} className="card mt-4 p-6">
          <h3 className="font-display text-lg font-semibold">
            Profile Information
          </h3>

          <div className="grid sm:grid-cols-2 gap-4 mt-5">
            <div>
              <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <FiUser size={12} /> Full name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputCls}
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <FiMail size={12} /> Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputCls}
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="mt-4">
            <Message msg={profileMsg} />
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="btn-accent mt-4 flex items-center gap-2 disabled:opacity-60"
          >
            <FiCheck size={15} />
            {savingProfile ? "Saving..." : "Save Changes"}
          </button>
        </form>

        {/* ============ Change password ============ */}
        <form onSubmit={handlePasswordChange} className="card mt-4 p-6">
          <h3 className="font-display text-lg font-semibold flex items-center gap-2">
            <FiLock size={16} className="text-emerald-400" /> Change Password
          </h3>

          <div className="grid sm:grid-cols-3 gap-4 mt-5">
            <div>
              <label className="text-xs font-medium text-slate-400">
                Current password
              </label>
              <input
                type="password"
                value={pwd.oldPassword}
                onChange={(e) =>
                  setPwd({ ...pwd, oldPassword: e.target.value })
                }
                className={inputCls}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400">
                New password
              </label>
              <input
                type="password"
                value={pwd.newPassword}
                onChange={(e) =>
                  setPwd({ ...pwd, newPassword: e.target.value })
                }
                className={inputCls}
                placeholder="Min 6 characters"
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400">
                Confirm new
              </label>
              <input
                type="password"
                value={pwd.confirmPassword}
                onChange={(e) =>
                  setPwd({ ...pwd, confirmPassword: e.target.value })
                }
                className={inputCls}
                placeholder="Repeat it"
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="mt-4">
            <Message msg={pwdMsg} />
          </div>

          <button
            type="submit"
            disabled={savingPwd}
            className="btn-ghost mt-4 flex items-center gap-2 disabled:opacity-60 border border-white/10"
          >
            {savingPwd ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;

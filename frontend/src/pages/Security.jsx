import { useState } from "react";
import API from "../services/api";
import { toast } from "react-toastify";
import { Eye, EyeOff, ShieldCheck, Lock, key, ShieldAlert, CheckCircle2 } from "lucide-react";

function Security() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [loading, setLoading] = useState(false);

  // 🔥 Password strength logic
  const getStrength = (password) => {
    if (!password) return { label: "", color: "#e2e8f0", width: "0%" };
    if (password.length < 6) return { label: "Weak", color: "#ef4444", width: "33%" };
    if (!/[A-Z]/.test(password)) return { label: "Medium", color: "#f59e0b", width: "66%" };
    return { label: "Strong", color: "#10b981", width: "100%" };
  };

  const strength = getStrength(form.newPassword);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const isValid =
    form.currentPassword &&
    form.newPassword &&
    form.confirmPassword &&
    form.newPassword === form.confirmPassword &&
    form.newPassword.length >= 6;

  const handlePasswordChange = async () => {
    if (!isValid) return;
    try {
      setLoading(true);
      await API.post("/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success("Password updated successfully 🔐");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed ❌");
    } finally {
      setLoading(false);
    }
  };

  const toggleShow = (field) => {
    setShow((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="container-fluid py-4" style={{minHeight: "100vh" }}>
      <div className="mx-auto" style={{ maxWidth: "600px" }}>
        
        <h3 className="fw-bold mb-4 d-flex align-items-center gap-2">
          <ShieldCheck className="text-primary" size={28} /> Security Settings
        </h3>

        {/* 🔑 CHANGE PASSWORD CARD */}
        <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: "20px" }}>
          <div className="card-body p-4">
            <div className="d-flex align-items-center gap-2 mb-4">
              <Lock size={20} className="text-muted" />
              <h5 className="mb-0 fw-bold">Change Password</h5>
            </div>

            {/* Current Password */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">Current Password</label>
              <div className="position-relative">
                <input
                  type={show.current ? "text" : "password"}
                  name="currentPassword"
                  placeholder="••••••••"
                  className="form-control py-2 pe-5"
                  value={form.currentPassword}
                  onChange={handleChange}
                  style={{ borderRadius: "10px" }}
                />
                <button
                  type="button"
                  onClick={() => toggleShow("current")}
                  className="btn position-absolute end-0 top-0 h-100 border-0 text-muted"
                >
                  {show.current ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <hr className="my-4 opacity-50" />

            {/* New Password */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">New Password</label>
              <div className="position-relative">
                <input
                  type={show.new ? "text" : "password"}
                  name="newPassword"
                  placeholder="Minimum 6 characters"
                  className="form-control py-2 pe-5"
                  value={form.newPassword}
                  onChange={handleChange}
                  style={{ borderRadius: "10px" }}
                />
                <button
                  type="button"
                  onClick={() => toggleShow("new")}
                  className="btn position-absolute end-0 top-0 h-100 border-0 text-muted"
                >
                  {show.new ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* 🔥 Strength Meter */}
              {form.newPassword && (
                <div className="mt-2">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="small text-muted">Security level:</span>
                    <span className="small fw-bold" style={{ color: strength.color }}>{strength.label}</span>
                  </div>
                  <div className="progress" style={{ height: "6px", backgroundColor: "#e2e8f0", borderRadius: "10px" }}>
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{
                        width: strength.width,
                        backgroundColor: strength.color,
                        transition: "width 0.4s ease"
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="mb-4">
              <label className="form-label small fw-bold text-muted">Confirm New Password</label>
              <div className="position-relative">
                <input
                  type={show.confirm ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Match new password"
                  className="form-control py-2 pe-5"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  style={{ borderRadius: "10px" }}
                />
                <button
                  type="button"
                  onClick={() => toggleShow("confirm")}
                  className="btn position-absolute end-0 top-0 h-100 border-0 text-muted"
                >
                  {show.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* ❌ Match error */}
              {form.confirmPassword && form.newPassword !== form.confirmPassword && (
                <div className="d-flex align-items-center gap-1 text-danger mt-2 small fw-medium">
                  <ShieldAlert size={14} /> Passwords do not match
                </div>
              )}
            </div>

            <button
              className="btn btn-primary w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
              onClick={handlePasswordChange}
              disabled={!isValid || loading}
              style={{ borderRadius: "10px" }}
            >
              {loading ? "Updating..." : <><Lock size={18} /> Update Password</>}
            </button>
          </div>
        </div>

        {/* 🔒 STATUS CARD */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: "20px"}}>
          <div className="card-body p-4">
            <h6 className="fw-bold mb-3 ">Account Protection</h6>
            <div className="d-flex flex-column gap-2">
              <div className="d-flex align-items-center gap-2 opacity-75">
                <CheckCircle2 size={18} className="text-success" />
                <span>JWT Authentication Enabled</span>
              </div>
              <div className="d-flex align-items-center gap-2 opacity-75">
                <CheckCircle2 size={18} className="text-success" />
                <span>Secure Password Hashing (BCrypt)</span>
              </div>
              <div className="d-flex align-items-center gap-2 opacity-75">
                <CheckCircle2 size={18} className="text-success" />
                <span>Encrypted Connection (SSL)</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        .form-control:focus {
          border-color: #0d6efd;
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.1);
        }
        .btn-primary:disabled {
          background-color: #e2e8f0;
          border-color: #e2e8f0;
          color: #94a3b8;
        }
        @media (max-width: 576px) {
          .card-body { padding: 1.5rem !important; }
          h3 { font-size: 1.5rem; }
        }
      `}</style>
    </div>
  );
}

export default Security;
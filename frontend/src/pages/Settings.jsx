import { useEffect, useState, useRef } from "react";
import API from "../services/api";
import { toast } from "react-toastify";
import {
    Pencil,
    User,
    Bell,
    Moon,
    Sun,
    Smartphone,
    Mail,
    Save,
    AlertTriangle, // <--- Add this one here
    Camera
} from "lucide-react";
import { useApp } from "../context/AppContext";

function Settings() {
    const { setUser } = useApp();
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: "",
        mobile: "",
        profile_image: "",
        email_alerts: true,
        budget_exceeded_alert: true,
        near_limit_alert: true,
    });

    const [darkMode, setDarkMode] = useState(
        localStorage.getItem("theme") === "dark"
    );

    const { theme } = useApp();
    const isDark = theme === "dark";

    const fileInputRef = useRef(null);

    const loadSettings = async () => {
        try {
            const res = await API.get("/settings");
            setForm((prev) => ({
                ...prev,
                ...res.data,
                profile_image: res.data.profile_image || "",
            }));
        } catch {
            toast.error("Failed to load settings ❌");
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;
        loadSettings();
    }, []);

    useEffect(() => {
        if (darkMode) {
            document.body.classList.add("dark");
        } else {
            document.body.classList.remove("dark");
        }
    }, [darkMode]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            await API.put("/settings", form);
            toast.success("Settings updated ✅");
        } catch {
            toast.error("Update failed ❌");
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await API.post("/upload-profile", formData, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "multipart/form-data"
                },
            });

            // ✅ update local form
            setForm((prev) => ({
                ...prev,
                profile_image: res.data.image_url,
            }));

            // ✅ 🔥 THIS LINE FIXES NAVBAR
            setUser((prev) => ({
                ...prev,
                profile_image: res.data.image_url,
            }));

            toast.success("Profile image updated successfully ✅");
        } catch {
            toast.error("Upload failed ❌");
        }
    };

    const toggleTheme = () => {
        const newTheme = !darkMode;
        setDarkMode(newTheme);
        localStorage.setItem("theme", newTheme ? "dark" : "light");
    };

    return (
        <div className="container-fluid py-4" style={{ minHeight: "100vh" }}>
            <div className="max-width-container mx-auto" style={{ maxWidth: "800px" }}>

                <h3 className="fw-bold mb-4 d-flex align-items-center gap-2">
                    <span className="p-2 bg-primary bg-opacity-10 rounded-3 d-inline-flex">
                        <User className="text-primary" size={24} />
                    </span>
                    Settings
                </h3>

                {/* 👤 PROFILE SECTION */}
                <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: "20px" }}>
                    <div className="card-body p-4">
                        <h6 className="fw-bold mb-4 text-muted text-uppercase small tracking-wider">Account Profile</h6>

                        <div className="row align-items-center g-4">
                            <div className="col-12 col-md-4 text-center text-md-start d-flex justify-content-center">
                                <div className="position-relative d-inline-block">
                                    <div className="rounded-circle p-1 bg-white shadow-sm border border-2 border-primary border-opacity-25">
                                        <img
                                            src={form.profile_image || "https://i.pravatar.cc/150"}
                                            onError={(e) => { e.target.src = "https://i.pravatar.cc/150"; }}
                                            alt="profile"
                                            className="rounded-circle object-fit-cover shadow-inner"
                                            style={{ width: "120px", height: "120px" }}
                                        />
                                    </div>
                                    <button
                                        onClick={() => fileInputRef.current.click()}
                                        className="btn btn-primary position-absolute bottom-0 end-0 rounded-circle p-2 shadow-lg border border-2 border-white"
                                        title="Change Image"
                                    >
                                        <Camera size={16} />
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageUpload}
                                        className="d-none"
                                        accept="image/*"
                                    />
                                </div>
                            </div>

                            <div className="col-12 col-md-8">
                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-muted">Display Name</label>
                                    <div className="input-group border rounded-3 overflow-hidden">
                                        <span className="input-group-text bg-light border-0"><User size={16} className="text-muted" /></span>
                                        <input
                                            className="form-control border-0 bg-transparent py-2"
                                            name="name"
                                            value={form.name}
                                            onChange={handleChange}
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                </div>

                                <div className="mb-0">
                                    <label className="form-label small fw-bold text-muted">Mobile Number</label>
                                    <div className="input-group border rounded-3 overflow-hidden">
                                        <span className="input-group-text bg-light border-0"><Smartphone size={16} className="text-muted" /></span>
                                        <input
                                            className="form-control border-0 bg-transparent py-2"
                                            name="mobile"
                                            value={form.mobile}
                                            onChange={handleChange}
                                            placeholder="Enter mobile number"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 🔔 NOTIFICATIONS SECTION */}
                <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: "20px" }}>
                    <div className="card-body p-4">
                        <h6 className="fw-bold mb-4 text-muted text-uppercase small tracking-wider">Alert Preferences</h6>

                        <div className="list-group list-group-flush">
                            {[
                                { id: "email_alerts", label: "Email Notifications", icon: <Mail size={18} />, desc: "Receive weekly summaries via email" },
                                { id: "budget_exceeded_alert", label: "Budget Exceeded", icon: <AlertTriangle size={18} />, desc: "Get alerted when you go over your budget" },
                                { id: "near_limit_alert", label: "Threshold Alerts", icon: <Bell size={18} />, desc: "Notify when spending reaches 80% of budget" }
                            ].map((item) => (
                                <div key={item.id} className="list-group-item px-0 py-3 border-light d-flex align-items-center justify-content-between bg-transparent">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="p-2 bg-light rounded-2 text-primary">{item.icon}</div>
                                        <div>
                                            <p className="mb-0 fw-semibold" style={{ color: theme === "dark" ? "#fff" : "#000" }}>{item.label}</p>
                                            <small className="text-muted d-none d-sm-block">{item.desc}</small>
                                        </div>
                                    </div>
                                    <div className="form-check form-switch mb-0">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            name={item.id}
                                            checked={!!form[item.id]}
                                            onChange={handleChange}
                                            style={{ width: '2.5em', height: '1.25em', cursor: 'pointer' }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 🌙 THEME SECTION */}
                <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: "20px" }}>
                    <div className="card-body p-4">
                        <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center gap-3">
                                <div className={`p-2 rounded-2 ${darkMode ? 'bg-warning bg-opacity-10 text-warning' : 'bg-primary bg-opacity-10 text-primary'}`}>
                                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                                </div>
                                <div>
                                    <h6 className="mb-0 fw-bold">Appearance</h6>
                                    <p className="mb-0 text-muted small">Switch between light and dark themes</p>
                                </div>
                            </div>
                            <div className="form-check form-switch mb-0">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={darkMode}
                                    onChange={toggleTheme}
                                    style={{ width: '2.5em', height: '1.25em', cursor: 'pointer' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 💾 SAVE BUTTON */}
                {/* 💾 SAVE BUTTON */}
                <div className="mobile-save-bar d-md-none"> {/* Updated this line */}
                    <button className="btn btn-primary w-100 py-2 fw-bold shadow" onClick={handleSave} disabled={loading}>
                        {loading ? "Saving..." : <><Save size={18} className="me-2" /> Save Settings</>}
                    </button>
                </div>

                <div className="d-none d-md-block text-end">
                    <button className="btn btn-primary px-5 py-2 fw-bold shadow-sm" onClick={handleSave} disabled={loading} style={{ borderRadius: "10px" }}>
                        {loading ? "Saving..." : <><Save size={18} className="me-2" /> Save Changes</>}
                    </button>
                </div>

            </div>

            <style>{`
    .custom-switch { width: 2.5em !important; height: 1.25em !important; cursor: pointer; }
    .form-control:focus { box-shadow: none; border-color: #0d6efd; }
    
    /* 1. Ensure the floating bar stays behind the sidebar */
    .mobile-save-bar {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(10px);
        padding: 1rem;
        z-index: 100; /* Lowered this */
        border-top: 1px solid #dee2e6;
    }

    /* 2. Target your Sidebar directly (assuming it has a class like .sidebar or similar) */
    /* If your sidebar uses a common library, we need to ensure its z-index is higher than 100 */
    .sidebar, .offcanvas, [role="navigation"] {
        z-index: 1060 !important; 
    }

    /* 3. Dark mode support for the floating bar */
    .dark .mobile-save-bar {
        background: rgba(30, 41, 59, 0.9); /* Dark slate background */
        border-top-color: #334155;
    }

    @media (max-width: 576px) {
        .card-body { padding: 1.25rem !important; }
        h3 { font-size: 1.5rem; }
    }

    .custom-switch { width: 2.5em !important; height: 1.25em !important; cursor: pointer; }
    .form-control:focus { box-shadow: none; border-color: #0d6efd; }
    
    .mobile-save-bar {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(8px);
        padding: 1rem;
        z-index: 10; /* Keep this very low */
        border-top: 1px solid #dee2e6;
    }

    /* This forces the sidebar to the very top layer */
    .sidebar, 
    .offcanvas, 
    .offcanvas-collapse,
    [role="navigation"],
    nav {
        z-index: 9999 !important; 
    }

    .dark .mobile-save-bar {
        background: rgba(15, 23, 42, 0.9);
        border-top-color: #334155;
    }

    /* Add padding to the bottom of the container so the button doesn't hide content */
    .max-width-container {
        padding-bottom: 80px; 
    }

    @media (max-width: 576px) {
        .card-body { padding: 1.25rem !important; }
        h3 { font-size: 1.5rem; }
    }
`}</style>
        </div>
    );
}

// Add this to your imports if not available: 
// import { AlertTriangle } from "lucide-react";

export default Settings;
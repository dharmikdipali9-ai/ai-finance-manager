import { useNavigate } from "react-router-dom";
import {
  Bell,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  Moon,
  Sun,
  Settings
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { Menu } from "lucide-react";
import { useState, useEffect, useRef } from "react";

function Topbar({ pageTitle = "Dashboard" }) {
  const navigate = useNavigate();

  const {
    user,
    unreadAlerts,
    markAlertsSeen,
    theme,
    toggleTheme,
    toggleSidebar
  } = useApp();

  const isDark = theme === "dark";

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🔥 close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      style={{
        height: "64px",
        background: isDark
          ? "rgba(15, 23, 42, 0.85)"
          : "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        borderBottom: isDark
          ? "1px solid rgba(255,255,255,0.08)"
          : "1px solid #e2e8f0",
        position: "sticky",
        top: 0,
        zIndex: 1000
      }}
    >

      {/* LEFT */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <button onClick={toggleSidebar} style={btnStyle(isDark)}>
          <Menu size={18} color={isDark ? "#ffffff" : "#020617"} />
        </button>

        {/* ❌ hide in mobile */}
        {!isMobile && (
          <>
            <div style={logoStyle}>
              <LayoutDashboard size={16} color="white" />
            </div>

            <h5 style={titleStyle(isDark)}>
              {pageTitle}
            </h5>
          </>
        )}
      </div>

      {/* RIGHT */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>

        {/* THEME */}
        <div onClick={toggleTheme} style={btnStyle(isDark)}>
          {isDark ? <Sun size={16} color="#facc15" /> : <Moon size={16} />}
        </div>

        {/* NOTIFICATION */}
        <div
          onClick={async () => {
            await markAlertsSeen();
            navigate("/alerts");
          }}
          style={{ ...btnStyle(isDark), position: "relative" }}
        >
          <Bell size={17} />

          {unreadAlerts > 0 && (
            <span style={badgeStyle}>
              {unreadAlerts > 9 ? "9+" : unreadAlerts}
            </span>
          )}
        </div>

        {/* PROFILE */}
        <div
          ref={dropdownRef}
          style={{ position: "relative" }}
        >
          <div
            onClick={() => setOpenDropdown(!openDropdown)}
            style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
          >
            {user?.profile_image ? (
              <img src={`${user.profile_image}?t=${Date.now()}`} alt="profile" style={avatarStyle} />
            ) : (
              <div style={avatarFallback}>
                {initials}
              </div>
            )}

            {/* ✅ show name ONLY in desktop */}
            {!isMobile && (
              <div style={{ lineHeight: "1.2" }}>
                <p style={{ margin: 0, fontSize: "13px", fontWeight: 600 }}>
                  {user?.name || "User"}
                </p>
                <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>
                  Administrator
                </p>
              </div>
            )}

            {!isMobile && <ChevronDown size={14} />}
          </div>

          {/* 🔽 DROPDOWN */}
          {openDropdown && (
            <div style={dropdownStyle(isDark)}>

              {/* ✅ optional: show name inside dropdown for mobile (better UX) */}
              {isMobile && (
                <div style={{ padding: "10px", borderBottom: "1px solid #e2e8f0" }}>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: 600 }}>
                    {user?.name || "User"}
                  </p>
                  <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>
                    Administrator
                  </p>
                </div>
              )}

              <div
                onClick={() => {
                  navigate("/settings");
                  setOpenDropdown(false);
                }}
                style={dropdownItem}
              >
                <Settings size={14} /> Settings
              </div>

              {isMobile && (
                <div onClick={logout} style={{ ...dropdownItem, color: "#ef4444" }}>
                  <LogOut size={14} /> Logout
                </div>
              )}
            </div>
          )}
        </div>
        {/* 🚪 DESKTOP LOGOUT */}
        {!isMobile && (
          <button onClick={logout} style={logoutBtn}>
            <LogOut size={14} />
            Logout
          </button>
        )}
      </div>

      <style>
        {`
          @keyframes pop {
            0% { transform: scale(0.5); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}

/* 🔹 styles */
const btnStyle = (isDark) => ({
  width: 38,
  height: 38,
  borderRadius: "10px",
  border: isDark ? "1px solid #1e293b" : "1px solid #e2e8f0",
  background: isDark ? "#020617" : "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer"
});

const logoStyle = {
  width: 32,
  height: 32,
  borderRadius: "10px",
  background: "linear-gradient(135deg,#325FD7,#1e3a8a)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const titleStyle = (isDark) => ({
  margin: 0,
  fontSize: "15px",
  fontWeight: 600,
  color: isDark ? "#fff" : "#1e293b"
});

const avatarStyle = {
  width: 36,
  height: 36,
  borderRadius: "50%",
  objectFit: "cover"
};

const avatarFallback = {
  width: 36,
  height: 36,
  borderRadius: "50%",
  background: "linear-gradient(135deg,#325FD7,#1e3a8a)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
  fontWeight: 700
};

const badgeStyle = {
  position: "absolute",
  top: 2,
  right: 2,
  background: "#ef4444",
  color: "white",
  fontSize: "10px",
  fontWeight: "700",
  padding: "2px 6px",
  borderRadius: "999px"
};

const dropdownStyle = (isDark) => ({
  position: "absolute",
  top: "48px",
  right: 0,
  background: isDark ? "#020617" : "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
  width: "150px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  zIndex: 1000
});

const dropdownItem = {
  padding: "10px",
  fontSize: "13px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "8px"
};

const logoutBtn = {
  padding: "7px 14px",
  borderRadius: "10px",
  border: "none",
  background: "rgba(239,68,68,0.1)",
  color: "#ef4444",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "6px"
};

export default Topbar;
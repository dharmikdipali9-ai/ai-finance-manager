import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CreditCard,
  ArrowRightLeft,
  LayoutGrid,
  Target,
  TrendingUp,
  PieChart,
  Lightbulb,
  Search,
  Bell,
  Settings,
  ShieldCheck
} from "lucide-react";

import { useApp } from "../context/AppContext";

function Sidebar() {
  const location = useLocation();

  // 🔥 SAME LOGIC + added toggleSidebar (no change to your existing)
  const { unreadAlerts, markAlertsSeen, sidebarOpen, toggleSidebar } = useApp();

  // ✅ safer mobile check
  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  const mainMenu = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={16} /> },
    { name: "Accounts", path: "/accounts", icon: <CreditCard size={16} /> },
    { name: "Transactions", path: "/transactions", icon: <ArrowRightLeft size={16} /> },
    { name: "Budget", path: "/budget", icon: <LayoutGrid size={16} /> },
    { name: "Goals", path: "/goals", icon: <Target size={16} /> },
    { name: "Investments", path: "/investments", icon: <TrendingUp size={16} /> },
    { name: "Reports", path: "/reports", icon: <PieChart size={16} /> },
    { name: "Insights", path: "/insights", icon: <Lightbulb size={16} /> },
    { name: "Search", path: "/search", icon: <Search size={16} /> },
    { name: "Alerts", path: "/alerts", icon: <Bell size={16} /> },
  ];

  const bottomMenu = [
    { name: "Settings", path: "/settings", icon: <Settings size={16} /> },
    { name: "Security", path: "/security", icon: <ShieldCheck size={16} /> },
  ];

  const linkStyle = (path) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: sidebarOpen ? "flex-start" : "center",
    gap: "12px",
    padding: "5px 14px",
    marginBottom: "6px",
    borderRadius: "10px",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "500",
    letterSpacing: "0.3px",
    color: location.pathname === path ? "#ffffff" : "#cbd5e1",
    background:
      location.pathname === path
        ? "linear-gradient(135deg,#325FD7,#1d4ed8)"
        : "transparent",
    boxShadow:
      location.pathname === path
        ? "0 4px 12px rgba(50,95,215,0.3)"
        : "none",
    transition: "all 0.25s ease",
    position: "relative"
  });

  return (
    <div
      style={{
        width: sidebarOpen ? "230px" : "80px",
        transform: isMobile
          ? sidebarOpen
            ? "translateX(0)"
            : "translateX(-100%)"
          : "translateX(0)",
        transition: "all 0.3s ease",
        height: "100vh",
        background: "#000",
        position: "fixed",
        left: 0,
        top: 0,
        padding: "22px 10px",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid #0f172a",
        zIndex: 1000,
      }}
    >
      {/* 🔹 LOGO */}
      <div
        style={{
          padding: "5px",
          marginBottom: "10px",
          color: "white",
          fontWeight: "700",
          fontSize: "18px",
          letterSpacing: "1px",
          display: "flex",
          alignItems: "center",
          justifyContent: sidebarOpen ? "flex-start" : "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #325FD7, #1d4ed8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            fontWeight: "700",
          }}
        >
          AI
        </div>

        {sidebarOpen && "AI Invest"}
      </div>

      {/* 🔹 MAIN MENU */}
      {mainMenu.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          style={linkStyle(item.path)}
          onClick={() => {
            if (item.name === "Alerts") {
              markAlertsSeen();
            }

            // 🔥 close sidebar on mobile
            if (isMobile) {
              toggleSidebar();
            }
          }}
          onMouseEnter={(e) => {
            if (location.pathname !== item.path) {
              e.currentTarget.style.background = "#0f172a";
            }
          }}
          onMouseLeave={(e) => {
            if (location.pathname !== item.path) {
              e.currentTarget.style.background = "transparent";
            }
          }}
        >
          {item.icon}

          {sidebarOpen && item.name}

          {/* 🔴 ALERT BADGE */}
          {item.name === "Alerts" && unreadAlerts > 0 && (
            <span
              style={{
                marginLeft: sidebarOpen ? "auto" : "0",
                position: sidebarOpen ? "static" : "absolute",
                right: sidebarOpen ? "auto" : "10px",
                top: sidebarOpen ? "auto" : "6px",
                background: "#ef4444",
                color: "white",
                fontSize: "10px",
                padding: "3px 8px",
                borderRadius: "999px",
                fontWeight: "600",
              }}
            >
              {unreadAlerts > 9 ? "9+" : unreadAlerts}
            </span>
          )}
        </Link>
      ))}

      {/* 🔹 BOTTOM MENU */}
      <div
        style={{
          marginTop: "auto",
          borderTop: "1px solid #1e293b",
          paddingTop: "8px",
        }}
      >
        {bottomMenu.map((item) => (
          <Link key={item.path} to={item.path} style={linkStyle(item.path)}>
            {item.icon}
            {sidebarOpen && item.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;
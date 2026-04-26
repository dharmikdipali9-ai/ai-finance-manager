import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Footer from "./Footer";
import { useApp } from "../context/AppContext";

function Layout({ children }) {
  const { sidebarOpen, toggleSidebar } = useApp();

  const isMobile = window.innerWidth < 768;

  return (
    <div className="d-flex">

      {/* 🔹 SIDEBAR */}
      <Sidebar />

      {/* 🔥 OVERLAY (mobile only) */}
      {isMobile && sidebarOpen && (
        <div
          onClick={toggleSidebar}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            zIndex: 999,
          }}
        />
      )}

      {/* 🔹 MAIN CONTENT */}
      <div
        style={{
          flex: 1,
          marginLeft: isMobile
            ? "0px" // 📱 no margin in mobile
            : sidebarOpen
            ? "230px" // 🟦 full sidebar
            : "80px", // 🟨 collapsed sidebar
          transition: "all 0.3s ease",
        }}
      >
        {/* 🔹 TOPBAR */}
        <Topbar />

        {/* 🔹 PAGE CONTENT */}
        <div className="p-4">
          {children}
        </div>

        {/* 🔹 FOOTER */}
        <Footer />
      </div>
    </div>
  );
}

export default Layout;
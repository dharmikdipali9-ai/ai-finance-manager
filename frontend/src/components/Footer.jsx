import { useApp } from "../context/AppContext";

function Footer() {
  const { theme } = useApp();

  const isDark = theme === "dark";

  return (
    <footer
      style={{
        width: "100%",
        padding: "14px 24px",
        background: isDark ? "#020617" : "#ffffff",
        borderTop: isDark
          ? "1px solid #1e293b"
          : "1px solid #e2e8f0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: "13px",
        color: isDark ? "#94a3b8" : "#475569",
      }}
    >
      {/* Left */}
      <div>
        © 2026 AI-Based Personal Finance & Investment
      </div>

      {/* Right */}
      <div>
        Design & Developed by{" "}
        <a href="https://kavyainfoweb.com/" target="_blank">
        <span style={{ color: "#325FD7", fontWeight: 600 }}>
          Kavya Infoweb Pvt. Ltd
        </span>
        </a>
      </div>
    </footer>
  );
}

export default Footer;
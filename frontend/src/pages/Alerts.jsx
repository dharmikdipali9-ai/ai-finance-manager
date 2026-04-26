import { useEffect, useState } from "react";
import API from "../services/api";
import { toast } from "react-toastify";
import { useApp } from "../context/AppContext";
import { 
  Bell, 
  Trash2, 
  CheckCircle2, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  BarChart3, 
  Clock 
} from "lucide-react";

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const { markAlertsSeen } = useApp();

  const loadAlerts = async () => {
    try {
      const res = await API.get("/notifications");
      setAlerts(res.data);
    } catch {
      toast.error("Failed to load alerts ❌");
    }
  };

  const markRead = async () => {
    try {
      await API.put("/notifications/read");
      markAlertsSeen();
    } catch {
      console.log("Read error");
    }
  };

  const clearAll = async () => {
    try {
      await API.delete("/notifications/all");
      setAlerts([]);
      toast.success("All notifications cleared 🧹");
    } catch {
      toast.error("Failed to clear notifications ❌");
    }
  };

  useEffect(() => {
    loadAlerts();
    markRead();

    const interval = setInterval(() => {
      loadAlerts();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container-fluid py-4" style={{minHeight: "100vh" }}>
      
      {/* HEADER */}
      <div className="row align-items-center mb-4 g-3 px-2">
        <div className="col-12 col-sm-6">
          <h3 className="fw-bold d-flex align-items-center gap-2 mb-1">
            <Bell className="text-primary" size={28} /> Alerts & Notifications
          </h3>
          <p className="text-muted mb-0">Stay updated with your financial goals and activity</p>
        </div>
        <div className="col-12 col-sm-6 text-sm-end">
          {alerts.length > 0 && (
            <button
              className="btn btn-outline-danger d-inline-flex align-items-center gap-2 px-3 py-2"
              onClick={clearAll}
              style={{ borderRadius: "10px", transition: "all 0.2s" }}
            >
              <Trash2 size={18} /> Clear All Notifications
            </button>
          )}
        </div>
      </div>

      {/* CONTENT */}
      {alerts.length === 0 ? (
        <div className="text-center py-5">
          <div className="bg-white d-inline-block p-4 rounded-circle shadow-sm mb-3">
            <CheckCircle2 size={48} className="text-success opacity-75" />
          </div>
          <h4 className="fw-bold">No new alerts 🎉</h4>
          <p className="text-muted">You're all caught up! We'll notify you here for any updates.</p>
        </div>
      ) : (
        <div className="row g-3">
          {alerts.map((a) => {
            let borderColor = "var(--bs-secondary)";
            let Icon = Bell;
            let iconColor = "text-secondary";
            let bgColor = "bg-secondary";

            if (a.type === "goal") {
              borderColor = "var(--bs-success)";
              Icon = Target;
              iconColor = "text-success";
              bgColor = "bg-success";
            } else if (a.type === "investment") {
              borderColor = "var(--bs-primary)";
              Icon = TrendingUp;
              iconColor = "text-primary";
              bgColor = "bg-primary";
            } else if (a.type === "budget") {
              borderColor = "var(--bs-danger)";
              Icon = AlertTriangle;
              iconColor = "text-danger";
              bgColor = "bg-danger";
            } else if (a.type === "report") {
              borderColor = "var(--bs-info)";
              Icon = BarChart3;
              iconColor = "text-info";
              bgColor = "bg-info";
            }

            return (
              <div className="col-12 col-md-6 col-lg-4" key={a.id}>
                <div
                  className="card border-0 shadow-sm h-100 position-relative"
                  style={{
                    borderRadius: "18px",
                    borderLeft: `5px solid ${borderColor}`,
                    background: a.is_read ? "#fcfdfe" : "#ffffff",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow = "0 8px 15px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className={`d-flex align-items-center gap-2 ${iconColor} fw-bold`}>
                        <Icon size={20} />
                        <span className="text-uppercase small tracking-wider">{a.type}</span>
                      </div>
                      {!a.is_read && (
                        <span className="badge rounded-pill bg-danger px-2 py-1 shadow-sm" style={{ fontSize: '0.7rem' }}>
                          NEW
                        </span>
                      )}
                    </div>

                    <p className={`mb-3 ${a.is_read ? "text-muted" : "text-dark fw-medium"}`} style={{ fontSize: "0.95rem", lineHeight: "1.5" }}>
                      {a.message}
                    </p>

                    <div className="d-flex align-items-center gap-2 text-muted mt-auto pt-2 border-top border-light">
                      <Clock size={14} />
                      <small style={{ fontSize: "0.8rem" }}>{a.created_at}</small>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .tracking-wider { letter-spacing: 0.05em; }
        .btn-outline-danger:hover { background-color: #dc3545; color: white; }
        @media (max-width: 576px) {
          .container-fluid { padding-left: 15px; padding-right: 15px; }
          .card-body { padding: 1.25rem !important; }
          h3 { font-size: 1.4rem; }
        }
      `}</style>
    </div>
  );
}

export default Alerts;
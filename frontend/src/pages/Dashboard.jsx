import { useEffect, useState } from "react";
import API from "../services/api";
import { Wallet, ArrowDown, ArrowUp, TrendingUp, Clock, FileText, ChevronRight } from "lucide-react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useNavigate } from "react-router-dom";

ChartJS.register(ArcElement, Tooltip, Legend);

const formatText = (text) => {
  if (!text) return "";
  return text
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

function Dashboard() {
  const [data, setData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loadingReport, setLoadingReport] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/dashboard")
      .then((res) => {
        setData(res.data);
        localStorage.setItem("name", res.data.name);
      })
      .catch((err) => console.error("Dashboard error:", err));

    API.get("/transactions")
      .then((res) => {
        setTransactions(res.data.slice(0, 5));
      })
      .catch((err) => console.error("Transaction error:", err));
  }, []);

  const handleGenerateReport = async () => {
    try {
      setLoadingReport(true);
      const [m, y, c] = await Promise.all([
        API.get("/monthly-report"),
        API.get("/yearly-report"),
        API.get("/analytics/category"),
      ]);

      const monthlyData = Object.keys(m.data).map((key) => ({
        month: key,
        income: m.data[key].income || 0,
        expense: m.data[key].expense || 0,
        savings: (m.data[key].income || 0) - (m.data[key].expense || 0),
      }));

      const yearlyData = Object.keys(y.data).map((key) => ({
        year: key,
        amount: y.data[key],
      }));

      const categoryData = Object.keys(c.data).map((key) => ({
        name: key,
        value: c.data[key],
      }));

      const { exportFinancePDF } = await import("../utils/exportReport");
      exportFinancePDF(monthlyData, yearlyData, categoryData);
    } catch (err) {
      console.error("Report error:", err);
    } finally {
      setLoadingReport(false);
    }
  };

  if (!data) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-grow text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: ["Income", "Expense", "Balance"],
    datasets: [
      {
        data: [data.income, data.expense, data.balance],
        backgroundColor: ["#10b981", "#ef4444", "#3b82f6"],
        hoverOffset: 10,
        borderWidth: 0,
      },
    ],
  };

  const formatCurrency = (val) => new Intl.NumberFormat("en-IN").format(val);

  return (
    <div className="container-fluid py-3 py-md-4" style={{ minHeight: "100vh" }}>

      {/* 🔹 Header Section */}
      <div className="row align-items-center mb-4 g-3">
        <div className="col-12 col-md-8">
          <h2 className="fw-bold mb-1">
            Hey, {data.name}! 👋
          </h2>
          <p className="text-muted mb-0 small">
            Here's what's happening with your money today.
          </p>
        </div>
        <div className="col-12 col-md-4 text-md-end">
          <button
            className="btn btn-primary w-100 w-md-auto shadow-sm px-4 py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
            onClick={handleGenerateReport}
            disabled={loadingReport}
            style={{ borderRadius: "12px" }}
          >
            {loadingReport ? (
              <span className="spinner-border spinner-border-sm"></span>
            ) : (
              <>
                <FileText size={18} /> Generate Report
              </>
            )}
          </button>
        </div>
      </div>

      {/* 🔹 Stat Cards */}
      <div className="row g-3 mb-4">
        {[
          { label: "Income", val: `₹${formatCurrency(data.income)}`, icon: <ArrowUp size={20} />, color: "success" },
          { label: "Expense", val: `₹${formatCurrency(data.expense)}`, icon: <ArrowDown size={20} />, color: "danger" },
          { label: "Balance", val: `₹${formatCurrency(data.balance)}`, icon: <Wallet size={20} />, color: "primary" },
          { label: "Savings", val: `${data.savings_rate}%`, icon: <TrendingUp size={20} />, color: "warning" },
        ].map((item, idx) => (
          <div className="col-6 col-md-3" key={idx}>
            <div className="card border-0 shadow-sm h-100 p-2 p-md-3" style={{ borderRadius: "20px" }}>
              <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center">
                <div className={`bg-${item.color} bg-opacity-10 text-${item.color} p-2 p-md-3 rounded-circle mb-2 mb-md-0 me-md-3`}>
                  {item.icon}
                </div>
                <div>
                  <div className="text-muted small fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>
                    {item.label}
                  </div>
                  <h5 className="fw-bold mb-0 text-truncate" style={{ fontSize: 'calc(1rem + 0.2vw)' }}>{item.val}</h5>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* 🔹 Recent Transactions */}
        {/* 🔹 Recent Transactions */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm h-100 bg-body" style={{ borderRadius: "24px" }}>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0 text-body">Recent Activity</h5>
                <button
                  className="btn btn-link text-primary p-0 text-decoration-none fw-bold small transition-hover"
                  onClick={() => navigate("/transactions")}
                >
                  See All <ChevronRight size={16} />
                </button>
              </div>

              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <tbody>
                    {transactions.map((t, i) => (
                      <tr key={i} className="border-transparent">
                        <td className="ps-0 py-3 border-0">
                          <div className="d-flex align-items-center">
                            {/* Icon container with theme-aware background */}
                            <div className="p-3 bg-body-tertiary rounded-4 me-3 d-flex align-items-center justify-content-center">
                              <Clock size={20} className="text-secondary" />
                            </div>
                            <div>
                              <div className="fw-bold text-body mb-0">
                                {formatText(t.type)}
                              </div>
                              <div className="text-muted small">
                                {t.category}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="text-end border-0 pe-0 py-3">
                          <div className={`fw-bold fs-5 ${t.type.toLowerCase() === "expense" ? "text-danger" : "text-success"}`}>
                            {t.type.toLowerCase() === "expense" ? "-" : "+"} ₹{formatCurrency(t.amount)}
                          </div>
                          {/* Optional: Add a subtle timestamp or status if your API provides it later */}
                          <div className="text-muted small opacity-50">Completed</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {transactions.length === 0 && (
                  <div className="text-center py-5">
                    <p className="text-muted">No recent transactions found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 🔹 Analytics Chart */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "24px" }}>
            <div className="card-body p-4 d-flex flex-column">
              <h5 className="fw-bold mb-4">Cash Flow</h5>

              <div className="position-relative flex-grow-1 d-flex align-items-center justify-content-center">
                <div style={{ width: "200px", height: "200px" }}>
                  <Pie
                    data={chartData}
                    options={{
                      cutout: "75%",
                      plugins: {
                        legend: { display: false },
                        tooltip: { enabled: true }
                      },
                      maintainAspectRatio: true
                    }}
                  />
                </div>
                <div className="position-absolute text-center">
                  <div className="text-muted small mb-0">Available</div>
                  <div className="fw-bold text-primary" style={{ fontSize: "1.2rem" }}>
                    ₹{formatCurrency(data.balance)}
                  </div>
                </div>
              </div>

              {/* Custom Legend for Mobile Clarity */}
              <div className="d-flex justify-content-between mt-4 mb-3 px-2">
                <div className="small"><span className="badge rounded-circle p-1 me-1 bg-success"> </span> Income</div>
                <div className="small"><span className="badge rounded-circle p-1 me-1 bg-danger"> </span> Expense</div>
                <div className="small"><span className="badge rounded-circle p-1 me-1 bg-primary"> </span> Balance</div>
              </div>

              <div className="mt-auto">
                <div className="d-flex justify-content-between mb-2">
                  <span className="small text-muted fw-medium">Budget Efficiency</span>
                  <span className="small fw-bold text-primary">{data.savings_rate}%</span>
                </div>
                <div className="progress" style={{ height: "10px", borderRadius: "20px", backgroundColor: "#e2e8f0" }}>
                  <div
                    className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
                    role="progressbar"
                    style={{ width: `${data.savings_rate}%`, borderRadius: "20px" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .transition-hover:hover {
          transform: translateY(-5px);
          transition: all 0.3s ease;
        }
        .card { transition: transform 0.3s ease; }
        @media (max-width: 768px) {
          h2 { font-size: 1.5rem; }
          .card-body { padding: 1.25rem !important; }
        }
        tr {
        transition: background-color 0.2s ease;
        cursor: pointer;
      }
      `}</style>
    </div>
  );
}

export default Dashboard;
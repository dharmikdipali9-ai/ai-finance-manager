import { useEffect, useState } from "react";
import API from "../services/api";
import { toast } from "react-toastify";
import AmountInput from "../components/AmountInput";
import { Plus, Trash2, PieChart, AlertCircle, CheckCircle } from "lucide-react";

const formatText = (text) => {
  if (!text) return "";
  return text
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

function Budget() {
  const [form, setForm] = useState({ category: "", amount: "" });
  const [budgets, setBudgets] = useState([]);
  const userId = localStorage.getItem("user_id");

  const loadBudgets = async () => {
    try {
      const res = await API.get(`/budget-analysis`);
      setBudgets(res.data);
    } catch {
      toast.error("Failed to load budgets ❌");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    loadBudgets();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addBudget = async () => {
    if (!form.category || !form.amount) {
      return toast.warning("Fill all fields ⚠️");
    }
    try {
      await API.post("/budget", {
        user_id: userId,
        category: form.category,
        amount: parseFloat(form.amount),
      });
      toast.success("Budget added ✅");
      setForm({ category: "", amount: "" });
      loadBudgets();
    } catch {
      toast.error("Failed to add budget ❌");
    }
  };

  const confirmDelete = (category) => {
    toast(
      ({ closeToast }) => (
        <div>
          <p className="fw-semibold mb-2">Delete this budget?</p>
          <div className="d-flex justify-content-end gap-2">
            <button
              className="btn btn-sm btn-light"
              onClick={closeToast}
            >
              Cancel
            </button>
            <button
              className="btn btn-sm btn-danger"
              onClick={async () => {
                closeToast();
                try {
                  await API.delete(`/budget/${category}`);
                  toast.success("Deleted ✅");
                  loadBudgets();
                } catch {
                  toast.error("Delete failed ❌");
                }
              }}
            >
              Delete
            </button>
          </div>
        </div>
      )
    );
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "within":
        return { label: "Within Budget", color: "#10b981", bg: "#d1fae5", icon: <CheckCircle size={14} /> };
      case "near":
        return { label: "Near Limit", color: "#f59e0b", bg: "#fef3c7", icon: <AlertCircle size={14} /> };
      case "exceeded":
        return { label: "Exceeded", color: "#ef4444", bg: "#fee2e2", icon: <AlertCircle size={14} /> };
      default:
        return { label: "Unknown", color: "#6b7280", bg: "#f3f4f6", icon: null };
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat("en-IN").format(val);

  return (
    <div className="container-fluid py-4" style={{ minHeight: "100vh" }}>

      {/* 🔥 HEADER */}
      <div className="d-flex align-items-center mb-4 gap-2">
        <PieChart className="text-primary" size={28} />
        <h3 className="fw-bold mb-0">Budget Management</h3>
      </div>

      {/* ➕ ADD BUDGET CARD */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: "16px" }}>
        <div className="card-body p-4">
          <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
            <Plus size={20} className="text-primary" /> Set New Budget
          </h5>
          <div className="row g-3">
            <div className="col-12 col-md-5">
              <label className="small fw-bold text-muted mb-1">Category</label>
              <input
                name="category"
                placeholder="e.g. Food, Entertainment"
                className="form-control form-control-lg border-light-subtle"
                style={{ fontSize: "0.95rem", borderRadius: "10px" }}
                value={form.category}
                onChange={handleChange}
              />
            </div>

            <div className="col-12 col-md-5">
              <label className="small fw-bold text-muted mb-1">Monthly Limit</label>
              <div className="input-group input-group-lg">
                <span className="input-group-text bg-white border-end-0" style={{ borderRadius: "10px 0 0 10px" }}>₹</span>
                <AmountInput
                  value={form.amount}
                  onChange={(val) => setForm({ ...form, amount: val })}
                  className="form-control border-start-0"
                  style={{ borderRadius: "0 10px 10px 0", fontSize: "0.95rem" }}
                />
              </div>
            </div>

            <div className="col-12 col-md-2 d-flex align-items-end">
              <button
                className="btn btn-primary btn-lg w-100 fw-bold shadow-sm"
                onClick={addBudget}
                style={{ borderRadius: "10px" }}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 📋 BUDGET ANALYSIS */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: "16px" }}>
        <div className="card-body p-4">
          <h5 className="fw-bold mb-4">Monthly Analysis</h5>

          {budgets.length > 0 ? (
            <>
              {/* Desktop View Table */}
              <div className="table-responsive d-none d-md-block">
                <table className="table align-middle">
                  <thead className="text-muted small text-uppercase">
                    <tr>
                      <th className="border-0">Category</th>
                      <th className="border-0">Budget Limit</th>
                      <th className="border-0">Actual Spent</th>
                      <th className="border-0">Progress</th>
                      <th className="border-0">Status</th>
                      <th className="border-0 text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {budgets.map((b, i) => {
                      const status = getStatusInfo(b.status);
                      const percentage = Math.min((b.spent / b.budget) * 100, 100);
                      return (
                        <tr key={i}>
                          <td className="fw-bold text-dark">{formatText(b.category)}</td>
                          <td>₹{formatCurrency(b.budget)}</td>
                          <td className="fw-medium">₹{formatCurrency(b.spent)}</td>
                          <td style={{ width: "150px" }}>
                            <div className="progress" style={{ height: "6px", borderRadius: "10px" }}>
                              <div
                                className="progress-bar"
                                style={{ width: `${percentage}%`, backgroundColor: status.color }}
                              ></div>
                            </div>
                          </td>
                          <td>
                            <span className="badge d-inline-flex align-items-center gap-1 py-2 px-3"
                              style={{ backgroundColor: status.bg, color: status.color, borderRadius: "8px" }}>
                              {status.icon} {status.label}
                            </span>
                          </td>
                          <td className="text-end">
                            <button className="btn btn-link text-danger p-0" onClick={() => confirmDelete(b.category)}>
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile View Cards */}
              <div className="d-md-none">
                {budgets.map((b, i) => {
                  const status = getStatusInfo(b.status);
                  const percentage = Math.min((b.spent / b.budget) * 100, 100);
                  return (
                    <div key={i} className="p-3 mb-3 border rounded-3 shadow-xs">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="fw-bold mb-0">{formatText(b.category)}</h6>
                        <button className="btn btn-sm text-danger p-0" onClick={() => confirmDelete(b.category)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="d-flex justify-content-between small mb-1">
                        <span className="text-muted">Spent: ₹{formatCurrency(b.spent)}</span>
                        <span className="fw-bold">Limit: ₹{formatCurrency(b.budget)}</span>
                      </div>
                      <div className="progress mb-2" style={{ height: "6px" }}>
                        <div className="progress-bar" style={{ width: `${percentage}%`, backgroundColor: status.color }}></div>
                      </div>
                      <span className="badge w-100 py-2" style={{ backgroundColor: status.bg, color: status.color }}>
                        {status.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-5">
              <p className="text-muted mb-0">No budget goals set for this month.</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .form-control:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.1);
        }
        .shadow-xs { box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
      `}</style>
    </div>
  );
}

export default Budget;
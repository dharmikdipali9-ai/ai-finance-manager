import { useEffect, useState } from "react";
import API from "../services/api";
import { toast } from "react-toastify";
import AmountInput from "../components/AmountInput";
import { Target, TrendingUp, Plus, Trash2, Wallet, ArrowRightCircle } from "lucide-react";

export const formatText = (text) => {
  if (!text) return "";
  return text
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

function Goals() {
  const [form, setForm] = useState({ title: "", target_amount: "" });
  const [amounts, setAmounts] = useState({});
  const [goals, setGoals] = useState([]);
  const [accountsData, setAccountsData] = useState([]);
  const [selectedAccounts, setSelectedAccounts] = useState({});

  const loadGoals = async () => {
    try {
      const res = await API.get(`/goals`);
      setGoals(res.data);
    } catch {
      toast.error("Failed to load goals ❌");
    }
  };

  const loadAccounts = async () => {
    try {
      const res = await API.get("/accounts");
      setAccountsData(res.data);
    } catch {
      toast.error("Failed to load accounts ❌");
    }
  };

  useEffect(() => {
    loadGoals();
    loadAccounts();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addGoal = async () => {
    if (!form.title || !form.target_amount) {
      return toast.warning("Fill all fields ⚠️");
    }
    try {
      await API.post("/goal", {
        title: form.title,
        target_amount: parseFloat(form.target_amount)
      });
      toast.success("Goal created 🎯");
      setForm({ title: "", target_amount: "" });
      loadGoals();
    } catch {
      toast.error("Failed ❌");
    }
  };

  const addToGoal = async (goalId) => {
    const amount = Number(amounts[goalId]);
    const accountId = selectedAccounts[goalId];
    if (!amount || !accountId) {
      return toast.warning("Enter amount & select account ⚠️");
    }
    const goal = goals.find((g) => g.id === goalId);
    const remaining = goal.target - goal.saved;

    if (amount > remaining) {
      return toast.error(`You can add only ₹${format(remaining)} to complete this goal.`);
    }

    const newTotal = goal.saved + amount;
    const percent = (newTotal / goal.target) * 100;

    if (percent >= 80 && percent < 100) {
      toast.info("🎯 You are close to reaching your goal!");
    }

    try {
      await API.post("/goal/add", {
        goal_id: goalId,
        amount: amount,
        account_id: accountId
      });
      toast.success("Money added 💰");
      setAmounts({ ...amounts, [goalId]: "" });
      setSelectedAccounts({ ...selectedAccounts, [goalId]: "" });
      loadGoals();
      loadAccounts();
    } catch {
      toast.error("Failed ❌");
    }
  };

  const totalTarget = goals.reduce((sum, g) => sum + g.target, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.saved, 0);
  const format = (val) => new Intl.NumberFormat("en-IN").format(val);

  return (
    <div className="container-fluid py-4" style={{minHeight: "100vh" }}>
      <div className="d-flex align-items-center gap-2 mb-4">
        <Target className="text-primary" size={32} />
        <h3 className="fw-bold mb-0">My Goals</h3>
      </div>

      {/* 🟢 SUMMARY SECTION */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-6">
          <div className="card border-0 shadow-sm p-3" style={{ borderRadius: "16px" }}>
            <div className="d-flex align-items-center gap-2 mb-1 text-muted small fw-bold text-uppercase">
              <TrendingUp size={16} /> Total Target
            </div>
            <h4 className="fw-bold mb-0">₹{format(totalTarget)}</h4>
          </div>
        </div>
        <div className="col-6 col-md-6">
          <div className="card border-0 shadow-sm p-3" style={{ borderRadius: "16px" }}>
            <div className="d-flex align-items-center gap-2 mb-1 text-muted small fw-bold text-uppercase">
              <Plus size={16} className="text-success" /> Total Saved
            </div>
            <h4 className="fw-bold mb-0 text-success">₹{format(totalSaved)}</h4>
          </div>
        </div>
      </div>

      {/* ➕ CREATE GOAL SECTION */}
      <div className="card border-0 shadow-sm mb-5" style={{ borderRadius: "20px" }}>
        <div className="card-body p-4">
          <h5 className="fw-bold mb-3">Set a New Milestone</h5>
          <div className="row g-3">
            <div className="col-12 col-md-5">
              <input
                name="title"
                placeholder="What are you saving for?"
                className="form-control form-control-lg border-light-subtle"
                style={{ fontSize: "1rem", borderRadius: "12px" }}
                value={form.title}
                onChange={handleChange}
              />
            </div>
            <div className="col-12 col-md-5">
              <div className="input-group input-group-lg">
                <span className="input-group-text bg-white border-end-0" style={{ borderRadius: "12px 0 0 12px" }}>₹</span>
                <AmountInput
                  value={form.target_amount}
                  onChange={(val) => setForm({ ...form, target_amount: val })}
                  className="form-control border-start-0"
                  style={{ borderRadius: "0 12px 12px 0", fontSize: "1rem" }}
                  placeholder="Target Amount"
                />
              </div>
            </div>
            <div className="col-12 col-md-2">
              <button className="btn btn-primary btn-lg w-100 fw-bold shadow-sm" onClick={addGoal} style={{ borderRadius: "12px" }}>
                Create
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 📊 GOALS GRID */}
      <div className="row g-4">
        {goals.length > 0 ? (
          goals.map((g) => (
            <div key={g.id} className="col-12 col-lg-6">
              <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "24px" }}>
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="fw-bold mb-1">{formatText(g.title)}</h5>
                      <span className={`badge ${g.progress >= 100 ? 'bg-success' : 'bg-primary'} bg-opacity-10 text-${g.progress >= 100 ? 'success' : 'primary'} rounded-pill px-3`}>
                        {g.progress}% Completed
                      </span>
                    </div>
                    <button
                      className="btn btn-light text-danger rounded-circle p-2"
                      onClick={async () => {
                        if (!window.confirm("Delete goal and refund money?")) return;
                        try {
                          await API.delete(`/goal/${g.id}`);
                          toast.success("Goal deleted & refunded 💰");
                          loadGoals();
                          loadAccounts();
                        } catch { toast.error("Delete failed ❌"); }
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="d-flex justify-content-between align-items-end mb-2">
                    <span className="small text-muted fw-bold">₹{format(g.saved)}</span>
                    <span className="small text-muted">Goal: ₹{format(g.target)}</span>
                  </div>

                  <div className="progress mb-3" style={{ height: "10px", borderRadius: "10px", backgroundColor: "#e2e8f0" }}>
                    <div
                      className={`progress-bar progress-bar-striped progress-bar-animated ${
                        g.progress < 50 ? "bg-danger" : g.progress < 80 ? "bg-warning" : "bg-success"
                      }`}
                      style={{ width: `${g.progress}%`, borderRadius: "10px" }}
                    ></div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <small className="fw-medium text-secondary">
                      {g.progress >= 100 ? "🎉 Goal achieved!" : `₹${format(g.target - g.saved)} to go`}
                    </small>
                  </div>

                  {/* 🔥 ADD MONEY FORM */}
                  <div className="bg-light p-3 rounded-4 mt-2">
                    <div className="row g-2">
                      <div className="col-12 col-md-4">
                        <AmountInput
                          value={amounts[g.id] || ""}
                          onChange={(val) => setAmounts({ ...amounts, [g.id]: val })}
                          placeholder="Amount"
                          className="form-control-sm border-0 shadow-none"
                          style={{ borderRadius: "8px" }}
                        />
                      </div>
                      <div className="col-12 col-md-5">
                        <div className="d-flex align-items-center bg-white rounded-3 px-2 h-100">
                          <Wallet size={16} className="text-muted me-2" />
                          <select
                            className="form-select form-select-sm border-0 shadow-none"
                            value={selectedAccounts[g.id] || ""}
                            onChange={(e) => setSelectedAccounts({ ...selectedAccounts, [g.id]: Number(e.target.value) })}
                          >
                            <option value="">Account</option>
                            {accountsData
                              .filter((acc) => !amounts[g.id] || acc.balance >= Number(amounts[g.id]))
                              .map((acc) => (
                                <option key={acc.id} value={acc.id}>
                                  {acc.name} (₹{format(acc.balance)})
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-12 col-md-3">
                        <button className="btn btn-success btn-sm w-100 h-100 fw-bold d-flex align-items-center justify-content-center gap-1" onClick={() => addToGoal(g.id)} style={{ borderRadius: "8px" }}>
                          Add <ArrowRightCircle size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-5">
            <div className="bg-white d-inline-block p-4 rounded-circle mb-3 shadow-sm">
              <Target size={48} className="text-muted opacity-25" />
            </div>
            <h5 className="fw-bold">No milestones yet</h5>
            <p className="text-muted">Break down your big dreams into smaller goals.</p>
          </div>
        )}
      </div>

      <style>{`
        .form-control:focus, .form-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 0.25rem rgba(59, 130, 246, 0.1);
        }
        .progress-bar { transition: width 0.6s ease; }
        .card { transition: transform 0.2s ease; }
        @media (max-width: 768px) {
          .card-body { padding: 1.25rem !important; }
        }
      `}</style>
    </div>
  );
}

export default Goals;
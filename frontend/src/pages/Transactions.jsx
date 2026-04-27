import { useEffect, useState } from "react";
import API from "../services/api";
import { toast } from "react-toastify";
import AmountInput from "../components/AmountInput";
import {
  Search,
  Filter,
  Plus,
  History,
  ArrowUpCircle,
  ArrowDownCircle,
  Edit3,
  Trash2,
  Calendar,
  ChevronDown,
  ChevronUp
} from "lucide-react";

const formatText = (text) => {
  if (!text) return "";
  return text
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};


const ConfirmModal = ({ show, onClose, onConfirm, message }) => {
  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content p-4" style={{ borderRadius: "16px" }}>

          <h5 className="fw-bold mb-3">Confirm Action</h5>
          <p className="text-muted">{message}</p>

          <div className="d-flex justify-content-end gap-2 mt-3">
            <button className="btn btn-light" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-danger fw-bold" onClick={onConfirm}>
              Delete
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [editId, setEditId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);


  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    API.delete(`/transaction/${deleteId}`)
      .then(() => {
        toast.success("Deleted Successfully 🗑️");
        getTransactions();
      })
      .catch((err) => console.log(err));

    setShowConfirm(false);
    setDeleteId(null);
  };


  const [form, setForm] = useState({
    type: "expense",
    category: "",
    amount: "",
    account_id: "",
    date: ""
  });

  const getTransactions = () => {
    API.get("/transactions")
      .then((res) => setTransactions(res.data))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    getTransactions();
    API.get("/accounts")
      .then((res) => setAccounts(res.data))
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    if (form.type !== "expense") return;
    const selected = accounts.find((a) => a.id === form.account_id);
    if (selected && form.amount && selected.balance < Number(form.amount)) {
      setForm((prev) => ({ ...prev, account_id: "" }));
      toast.warning("Selected account has insufficient balance.");
    }
  }, [form.amount, form.type]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "account_id" ? Number(value) : value
    });
  };

  const addTransaction = () => {
    if (!form.category || !form.amount || !form.date) {
      return toast.warning("Please fill all fields ⚠️");
    }
    console.log("FORM DATA:", form);
    API.post("/transaction", form)
      .then((res) => {
        console.log("ADD RESPONSE:", res.data);
        toast.success("Transaction Added ✅");
        getTransactions();
      })
      .catch((err) => {
        console.log("ERROR:", err.response?.data);
        toast.error(err.response?.data?.error || "Failed ❌");
      });
  };

  const handleEdit = (t) => {
    setForm({ type: t.type, category: t.category, amount: t.amount, account_id: t.account_id, date: t.date });
    setEditId(t.id);
  };

  const updateTransaction = () => {
    API.put(`/transaction/${editId}`, form)
      .then(() => {
        toast.success("Updated Successfully ✏️");
        setEditId(null);
        setForm({ type: "expense", category: "", amount: "", account_id: "", date: "" });
        getTransactions();
      })
      .catch((err) => console.log(err));
  };


  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.category.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterType === "all" || t.type === filterType;
    const transactionDate = new Date(t.date);
    const matchesStart = !startDate || transactionDate >= new Date(startDate);
    const matchesEnd = !endDate || transactionDate <= new Date(endDate);
    return matchesSearch && matchesFilter && matchesStart && matchesEnd;
  });

  const filteredAccounts = accounts.filter((acc) => {
    if (form.type !== "expense" || !form.amount) return true;
    return acc.balance >= Number(form.amount);
  });

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="container-fluid px-3 px-md-4 py-3" style={{ minHeight: "100vh" }}>

      {/* HEADER */}
      <div className="mb-4">
        <h3 className="fw-bold d-flex align-items-center gap-2">
          <History size={28} className="text-primary" /> Transactions
        </h3>
        <p className="text-muted small">Track and manage your income and expenses</p>
      </div>

      {/* 🔍 FILTER & SEARCH SECTION */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: "20px" }}>
        <div className="card-body p-3 p-md-4">
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <label className="form-label small fw-bold text-muted">Search</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-0"><Search size={16} /></span>
                <input
                  type="text"
                  placeholder="e.g. Grocery, Salary..."
                  className="form-control border-0 bg-light"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="col-12 col-sm-4 col-md-2">
              <label className="form-label small fw-bold text-muted">Type</label>
              <select className="form-select border-0 bg-light" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div className="col-6 col-sm-4 col-md-3">
              <label className="form-label small fw-bold text-muted">From</label>
              <input type="date" className="form-control border-0 bg-light" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="col-6 col-sm-4 col-md-3">
              <label className="form-label small fw-bold text-muted">To</label>
              <input type="date" className="form-control border-0 bg-light" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* ➕ ADD / EDIT FORM */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: "20px", borderLeft: editId ? "6px solid #ffc107" : "6px solid #10b981" }}>
        <div className="card-body p-3 p-md-4">
          <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
            {editId ? <Edit3 size={18} className="text-warning" /> : <Plus size={18} className="text-success" />}
            {editId ? "Edit Transaction" : "New Transaction"}
          </h6>
          <div className="row g-3">
            <div className="col-6 col-md-2">
              <label className="form-label small fw-bold text-muted d-md-none">Type</label>
              <select name="type" value={form.type} onChange={handleChange} className="form-select border-0 bg-light fw-medium">
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div className="col-6 col-md-2">
              <label className="form-label small fw-bold text-muted d-md-none">Category</label>
              <input name="category" placeholder="Category" value={form.category} className="form-control border-0 bg-light" onChange={handleChange} />
            </div>
            <div className="col-6 col-md-2 position-relative">
              <label className="form-label small fw-bold text-muted d-md-none">Amount</label>
              <AmountInput
                value={form.amount}
                onChange={(val) => setForm({ ...form, amount: val })}
                className="form-control border-0 bg-light fw-bold"
                style={{ paddingLeft: "30px" }}
              />
              <span style={{ position: "absolute", left: "12px", bottom: "10px", color: "#64748b" }}>₹</span>
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label small fw-bold text-muted d-md-none">Account</label>
              <select name="account_id" className="form-select border-0 bg-light" value={form.account_id} onChange={handleChange}>
                <option value="">Select Account</option>
                {filteredAccounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name} (₹{a.balance})</option>
                ))}
              </select>
            </div>
            <div className="col-8 col-md-2">
              <label className="form-label small fw-bold text-muted d-md-none">Date</label>
              <input name="date" type="date" value={form.date} className="form-control border-0 bg-light" onChange={handleChange} />
            </div>
            <div className="col-4 col-md-1 d-grid align-self-end">
              <button
                className={`btn fw-bold border-0 ${editId ? "btn-warning" : "btn-primary"}`}
                onClick={editId ? updateTransaction : addTransaction}
                style={{ borderRadius: "10px" }}
              >
                {editId ? "Save" : "Add"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 📊 HISTORY — Desktop Table + Mobile Accordion */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: "20px", overflow: "hidden" }}>
        <div className="card-body p-0">
          <div className="p-3 p-md-4 border-bottom bg-white">
            <h6 className="fw-bold mb-0 text-dark">Transaction History</h6>
          </div>

          {/* ── DESKTOP TABLE (md and above) ── */}
          <div className="d-none d-md-block table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 border-0 text-muted small fw-bold">TYPE</th>
                  <th className="border-0 text-muted small fw-bold">CATEGORY</th>
                  <th className="border-0 text-muted small fw-bold">AMOUNT</th>
                  <th className="border-0 text-muted small fw-bold">DATE</th>
                  <th className="border-0 text-muted small fw-bold">PAYMENT</th>
                  <th className="px-4 border-0 text-muted text-end small fw-bold">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((t) => (
                    <tr key={t.id}>
                      <td className="px-4">
                        <div className={`d-flex align-items-center gap-2 fw-bold ${t.type === "income" ? "text-success" : "text-danger"}`} style={{ fontSize: "13px" }}>
                          {t.type === "income" ? <ArrowUpCircle size={16} /> : <ArrowDownCircle size={16} />}
                          {t.type.toUpperCase()}
                        </div>
                      </td>
                      <td className="fw-semibold text-dark">{formatText(t.category)}</td>
                      <td className="fw-bold">₹{new Intl.NumberFormat("en-IN").format(t.amount)}</td>
                      <td className="text-muted small">
                        <div className="d-flex align-items-center gap-1"><Calendar size={12} /> {t.date}</div>
                      </td>
                      <td><span className="badge rounded-pill bg-light text-dark border">{t.account}</span></td>
                      <td className="px-4 text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <button className="btn btn-light btn-sm text-warning" onClick={() => handleEdit(t)}><Edit3 size={16} /></button>
                          <button className="btn btn-light btn-sm text-danger" onClick={() => handleDeleteClick(t.id)}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      No transactions match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ── MOBILE ACCORDION (below md) ── */}
          <div className="d-md-none">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((t) => {
                const isOpen = expandedId === t.id;
                const isIncome = t.type === "income";
                return (
                  <div key={t.id} className="border-bottom">
                    {/* Accordion Header — always visible */}
                    <button
                      className="w-100 border-0 bg-white px-3 py-3 d-flex align-items-center justify-content-between"
                      style={{ cursor: "pointer", textAlign: "left" }}
                      onClick={() => toggleExpand(t.id)}
                    >
                      <div className="d-flex align-items-center gap-2 flex-grow-1 overflow-hidden">
                        <span className={isIncome ? "text-success" : "text-danger"}>
                          {isIncome ? <ArrowUpCircle size={18} /> : <ArrowDownCircle size={18} />}
                        </span>
                        <span className="fw-semibold text-dark text-truncate" style={{ fontSize: "14px" }}>
                          {formatText(t.category)}
                        </span>
                      </div>
                      <div className="d-flex align-items-center gap-2 flex-shrink-0 ms-2">
                        <span className={`fw-bold ${isIncome ? "text-success" : "text-danger"}`} style={{ fontSize: "14px" }}>
                          {isIncome ? "+" : "-"}₹{new Intl.NumberFormat("en-IN").format(t.amount)}
                        </span>
                        <span className="text-muted">
                          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </span>
                      </div>
                    </button>

                    {/* Accordion Body — shown when expanded */}
                    {isOpen && (
                      <div className="px-3 pb-3 bg-light" style={{ borderTop: "1px solid #e2e8f0" }}>
                        <div className="pt-3 d-flex flex-column gap-2">
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="text-muted small fw-bold">TYPE</span>
                            <span className={`badge rounded-pill fw-semibold ${isIncome ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`}>
                              {t.type.toUpperCase()}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="text-muted small fw-bold">DATE</span>
                            <span className="text-dark small d-flex align-items-center gap-1">
                              <Calendar size={12} className="text-muted" /> {t.date}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="text-muted small fw-bold">PAYMENT</span>
                            <span className="badge rounded-pill bg-white text-dark border">{t.account}</span>
                          </div>
                          <div className="d-flex justify-content-end gap-2 pt-2">
                            <button className="btn btn-light btn-sm text-warning d-flex align-items-center gap-1" onClick={() => handleEdit(t)}>
                              <Edit3 size={14} /> Edit
                            </button>
                            <button className="btn btn-light btn-sm text-danger d-flex align-items-center gap-1" onClick={() => handleDeleteClick(t.id)}>
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-5 text-muted">
                No transactions match your filters.
              </div>
            )}
          </div>

        </div>
      </div>
      <ConfirmModal
        show={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this transaction?"
      />

      <style>{`
        .form-control:focus, .form-select:focus {
          box-shadow: 0 0 0 3px rgba(50, 95, 215, 0.1);
          background-color: #fff !important;
        }
        .table-hover tbody tr:hover {
          background-color: #f1f5f9;
        }
        @media (max-width: 768px) {
          .container-fluid { padding-bottom: 80px; }
          .btn-sm { padding: 8px; }
        }
      `}</style>
    </div>
  );
}

export default Transactions;  
import { useState } from "react";
import API from "../services/api";
import { toast } from "react-toastify";
import { Search as SearchIcon, Filter, List, IndianRupee, Calendar, Tag } from "lucide-react";

function Search() {
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const format = (val) => new Intl.NumberFormat("en-IN").format(val);

  const formatText = (text) => {
    if (!text) return "";
    return text
      .replace(/([A-Z])/g, " $1")
      .replace(/[_-]/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await API.get(
        `/transactions/search?category=${category}&type=${type}`
      );
      setResults(res.data);
      if (res.data.length === 0) toast.info("No matching transactions found");
    } catch {
      toast.error("Search failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-4" style={{minHeight: "100vh" }}>
      
      {/* HEADER */}
      <div className="mb-4 px-2">
        <h3 className="fw-bold d-flex align-items-center gap-2">
          <SearchIcon className="text-primary" size={28} /> Search Transactions
        </h3>
        <p className="text-muted">Filter and find specific entries in your history</p>
      </div>

      {/* 🔎 FILTERS CARD */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: "20px" }}>
        <div className="card-body p-4">
          <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 text-primary">
            <Filter size={18} /> Quick Filters
          </h6>
          <div className="row g-3">
            <div className="col-12 col-md-5">
              <label className="form-label small fw-bold text-muted">Category</label>
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0">
                  <Tag size={16} className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="e.g. Food, Travel"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label small fw-bold text-muted">Transaction Type</label>
              <select
                className="form-select border-light-subtle"
                value={type}
                onChange={(e) => setType(e.target.value)}
                style={{ borderRadius: "10px" }}
              >
                <option value="">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <div className="col-12 col-md-3 d-flex align-items-end">
              <button 
                className="btn btn-primary w-100 fw-bold py-2 d-flex align-items-center justify-content-center gap-2" 
                onClick={handleSearch}
                disabled={loading}
                style={{ borderRadius: "10px" }}
              >
                {loading ? "Searching..." : <><SearchIcon size={18} /> Search</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 📊 RESULTS */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: "20px" }}>
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
              <List size={18} className="text-primary" /> 
              Results {results.length > 0 && <span className="badge bg-light text-primary rounded-pill">{results.length}</span>}
            </h6>
          </div>

          {results.length === 0 ? (
            <div className="text-center py-5">
              <div className="bg-light d-inline-block p-4 rounded-circle mb-3">
                <SearchIcon size={40} className="text-muted opacity-50"/>
              </div>
              <p className="text-muted fw-medium">No transactions found. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="table-responsive d-none d-md-block">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th className="border-0 text-muted small text-uppercase py-3">Category</th>
                    <th className="border-0 text-muted small text-uppercase py-3">Amount</th>
                    <th className="border-0 text-muted small text-uppercase py-3">Type</th>
                    <th className="border-0 text-muted small text-uppercase py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((t, i) => (
                    <tr key={i}>
                      <td className="fw-semibold">{t.category}</td>
                      <td className={t.amount > 0 ? "text-success fw-bold" : "text-danger fw-bold"}>
                        ₹{format(t.amount)}
                      </td>
                      <td>
                        <span className={`badge ${t.type === 'income' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} px-3 py-2 text-capitalize`}>
                          {formatText(t.type)}
                        </span>
                      </td>
                      <td className="text-muted">{t.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* MOBILE LIST VIEW (Hidden on desktop) */}
          <div className="d-md-none">
            {results.map((t, i) => (
              <div key={i} className="card border-light shadow-none mb-3" style={{ borderRadius: "12px", backgroundColor: "#fcfdfe" }}>
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="fw-bold h6 mb-0">{t.category}</span>
                    <span className={`fw-bold ${t.amount > 0 ? "text-success" : "text-danger"}`}>
                      ₹{format(t.amount)}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className={`badge ${t.type === 'income' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} px-2 py-1`}>
                      {formatText(t.type)}
                    </span>
                    <small className="text-muted d-flex align-items-center gap-1">
                      <Calendar size={12} /> {t.date}
                    </small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .form-control:focus, .form-select:focus {
          border-color: #0d6efd;
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.08);
        }
        .table-hover tbody tr:hover {
          background-color: #f8f9ff;
        }
        .bg-success-subtle { background-color: #e6f7ed; }
        .bg-danger-subtle { background-color: #fdeced; }
        @media (max-width: 768px) {
          .card-body { padding: 1.25rem !important; }
        }
      `}</style>
    </div>
  );
}

export default Search;
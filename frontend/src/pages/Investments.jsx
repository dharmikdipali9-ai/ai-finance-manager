import { useEffect, useState } from "react";
import API from "../services/api";
import { toast } from "react-toastify";
import { TrendingUp, TrendingDown, Briefcase, Plus, Trash2, Info, Wallet } from "lucide-react";

function Investments() {
    const [form, setForm] = useState({
        name: "",
        type: "stock",
        buy_price: "",
        quantity: ""
    });

    const [investments, setInvestments] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState("");
    const [summary, setSummary] = useState({});
    const [advice, setAdvice] = useState([]);

    const loadData = async () => {
        try {
            const res1 = await API.get("/investments");
            setInvestments(res1.data);

            const res2 = await API.get("/investment-summary");
            setSummary(res2.data);

            const res3 = await API.get("/accounts");
            setAccounts(res3.data);
        } catch {
            toast.error("Failed to load data ❌");
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        const generatedAdvice = investments.map(inv => {
            const percent = inv.invested > 0
                ? (inv.profit_loss / inv.invested) * 100
                : 0;

            if (percent > 20) {
                return `🚀 ${inv.name}: Strong rally! Consider profit booking`;
            }
            else if (percent > 10) {
                return `📈 ${inv.name}: Good profit, you can hold or book partial gains`;
            }
            else if (percent < -20) {
                return `⚠️ ${inv.name}: Heavy loss, consider exit strategy`;
            }
            else if (percent < -10) {
                return `📉 ${inv.name}: Downtrend, review fundamentals`;
            }
            else {
                return `⚖️ ${inv.name}: Stable, hold position`;
            }
        });

        // ✅ handle empty portfolio
        if (generatedAdvice.length === 0) {
            setAdvice(["Start investing to get AI-based insights 💡"]);
        } else {
            setAdvice(generatedAdvice);
        }
    }, [investments]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // 🔥 FIX: Calculate total and validate before adding
    const addInvestment = async () => {
        const { name, buy_price, quantity } = form;
        if (!name || !buy_price || !quantity || !selectedAccount) {
            return toast.warning("Fill all fields ⚠️");
        }

        const investmentTotal = parseFloat(buy_price) * parseFloat(quantity);
        const acc = accounts.find(a => a.id === Number(selectedAccount));

        if (!acc || acc.balance < investmentTotal) {
            return toast.error("Insufficient balance in selected account ❌");
        }

        try {
            const priceRes = await API.get(`/stock/${name}`);
            const current_price = priceRes.data.price;

            await API.post("/investment", {
                name,
                type: form.type,
                buy_price: parseFloat(buy_price),
                quantity: parseFloat(quantity),
                current_price,
                account_id: Number(selectedAccount)
            });

            toast.success("Investment added 💰");
            setForm({ name: "", type: "stock", buy_price: "", quantity: "" });
            setSelectedAccount("");
            loadData();
        } catch {
            toast.error("Failed to add investment ❌");
        }
    };

    const deleteInvestment = async (id) => {
        if (!window.confirm("Delete this investment?")) return;
        try {
            await API.delete(`/investment/${id}`);
            toast.success("Deleted & refunded 💰");
            loadData();
        } catch {
            toast.error("Failed ❌");
        }
    };

    const format = (val) => new Intl.NumberFormat("en-IN").format(val);

    // 🔥 LOGIC: Filter accounts that can afford the current input total
    const currentInvestmentTotal = Number(form.buy_price) * Number(form.quantity) || 0;

    return (
        <div className="container-fluid py-4" style={{ minHeight: "100vh" }}>

            <div className="d-flex align-items-center gap-2 mb-4 px-2">
                <Briefcase className="text-primary" size={28} />
                <h3 className="fw-bold mb-0">Portfolio</h3>
            </div>

            {/* SUMMARY CARDS */}
            <div className="row g-3 mb-4">
                <div className="col-12 col-md-4">
                    <div className="card border-0 shadow-sm p-3 h-100" style={{ borderRadius: "16px" }}>
                        <small className="text-muted text-uppercase fw-bold ls-1" style={{ fontSize: "11px" }}>Total Invested</small>
                        <h4 className="fw-bold mt-1 mb-0">₹{format(summary.total_invested || 0)}</h4>
                    </div>
                </div>
                <div className="col-12 col-md-4">
                    <div className="card border-0 shadow-sm p-3 h-100" style={{ borderRadius: "16px" }}>
                        <small className="text-muted text-uppercase fw-bold ls-1" style={{ fontSize: "11px" }}>Current Value</small>
                        <h4 className="fw-bold mt-1 mb-0">₹{format(summary.total_current || 0)}</h4>
                    </div>
                </div>
                <div className="col-12 col-md-4">
                    <div className="card border-0 shadow-sm p-3 h-100" style={{ borderRadius: "16px" }}>
                        <div className="d-flex justify-content-between align-items-start">
                            <small className="text-muted text-uppercase fw-bold ls-1" style={{ fontSize: "11px" }}>Profit / Loss</small>
                            {summary.profit_loss >= 0 ? <TrendingUp size={16} className="text-success" /> : <TrendingDown size={16} className="text-danger" />}
                        </div>
                        <h4 className={`fw-bold mt-1 mb-0 ${summary.profit_loss >= 0 ? "text-success" : "text-danger"}`}>
                            ₹{format(summary.profit_loss || 0)}
                        </h4>
                    </div>
                </div>
            </div>

            {/* ADD INVESTMENT FORM */}
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: "20px" }}>
                <div className="card-body p-4">
                    <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                        <Plus size={18} className="text-primary" /> New Investment
                    </h6>
                    <div className="row g-3">
                        <div className="col-12 col-md-3">
                            <input
                                name="name"
                                placeholder="Symbol (e.g. TCS.NS)"
                                className="form-control border-light-subtle"
                                style={{ borderRadius: "10px" }}
                                value={form.name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col-6 col-md-2">
                            <select
                                name="type"
                                className="form-select border-light-subtle text-capitalize"
                                style={{ borderRadius: "10px" }}
                                value={form.type}
                                onChange={handleChange}
                            >
                                <option value="stock">Stock</option>
                                <option value="crypto">Crypto</option>
                                <option value="mutual">Mutual</option>
                            </select>
                        </div>
                        <div className="col-6 col-md-2">
                            <div className="input-group">
                                <span className="input-group-text bg-transparent border-end-0">₹</span>
                                <input
                                    name="buy_price"
                                    type="number"
                                    placeholder="Price"
                                    className="form-control border-start-0"
                                    style={{ borderRadius: "0 10px 10px 0" }}
                                    value={form.buy_price}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className="col-6 col-md-2">
                            <input
                                name="quantity"
                                type="number"
                                placeholder="Qty"
                                className="form-control border-light-subtle"
                                style={{ borderRadius: "10px" }}
                                value={form.quantity}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col-6 col-md-2">
                            <select
                                className="form-select border-light-subtle"
                                style={{ borderRadius: "10px" }}
                                value={selectedAccount}
                                onChange={(e) => setSelectedAccount(e.target.value)}
                            >
                                <option value="">Select Account</option>
                                {/* 🔥 Logic: Only show accounts with enough balance */}
                                {accounts
                                    .filter(acc => acc.balance >= currentInvestmentTotal)
                                    .map(acc => (
                                        <option key={acc.id} value={acc.id}>
                                            {acc.name} (₹{format(acc.balance)})
                                        </option>
                                    ))}
                            </select>
                        </div>
                        <div className="col-12 col-md-1 d-grid">
                            <button className="btn btn-primary fw-bold" onClick={addInvestment} style={{ borderRadius: "10px" }}>
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-lg-8">
                    <div className="row g-3">
                        {investments.length > 0 ? (
                            investments.map((inv) => (
                                <div key={inv.id} className="col-12 col-md-6">
                                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "18px" }}>
                                        <div className="card-body p-3">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <div>
                                                    <h6 className="fw-bold mb-0">{inv.name}</h6>
                                                    <span className="badge bg-light text-secondary text-uppercase py-1 px-2" style={{ fontSize: "10px" }}>{inv.type}</span>
                                                </div>
                                                <button className="btn btn-link text-danger p-0" onClick={() => deleteInvestment(inv.id)}>
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                            <hr className="my-2 opacity-25" />
                                            <div className="d-flex justify-content-between mb-1">
                                                <small className="text-muted">Invested</small>
                                                <small className="fw-medium">₹{format(inv.invested)}</small>
                                            </div>
                                            <div className="d-flex justify-content-between mb-1">
                                                <small className="text-muted">Market Value</small>
                                                <small className="fw-medium">₹{format(inv.current_value)}</small>
                                            </div>
                                            <div className="d-flex justify-content-between mt-2 pt-2 border-top">
                                                <span className="small fw-bold">Profit/Loss</span>
                                                <span className={`small fw-bold ${inv.profit_loss >= 0 ? "text-success" : "text-danger"}`}>
                                                    {inv.profit_loss >= 0 ? "+" : ""}₹{format(inv.profit_loss)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-12 text-center py-5">
                                <div className="bg-white d-inline-block p-4 rounded-circle shadow-sm mb-3">
                                    <Wallet size={40} className="text-muted opacity-25" />
                                </div>
                                <h6 className="fw-bold">No assets found</h6>
                                <p className="text-muted small">Start building your portfolio today.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="col-lg-4 mt-3">
                    <div className="card border-0 shadow-sm sticky-top" style={{ borderRadius: "20px", top: "20px" }}>
                        <div className="card-body p-4">
                            <h6 className="mb-3 fw-bold d-flex align-items-center gap-2">
                                <Info size={18} className="text-info" /> AI Advisor
                            </h6>
                            <div className="advice-container">
                                {advice.length > 0 ? (
                                    advice.map((a, i) => (
                                        <div key={i} className={`p-3 mb-2 rounded-3 `} style={{ borderLeft: `4px solid #0dcaf0` }}>
                                            <p className="mb-0 fw-medium" style={{ fontSize: "13px", lineHeight: "1.5" }}>{a}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-muted small mb-0">No specific advice at the moment.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .ls-1 { letter-spacing: 0.5px; }
                .form-control:focus, .form-select:focus {
                    border-color: #0d6efd;
                    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.08);
                }
                @media (max-width: 768px) {
                    .card-body { padding: 1rem !important; }
                }
            `}</style>
        </div>
    );
}

export default Investments;
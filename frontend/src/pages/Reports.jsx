import { useEffect, useState } from "react";
import API from "../services/api";
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend, CartesianGrid
} from "recharts";
import { toast } from "react-toastify";
import { FileDown, Calendar, PieChart as PieIcon, BarChart3, TrendingUp } from "lucide-react";
import { exportFinancePDF } from "../utils/exportReport";

function Reports() {
    const [monthly, setMonthly] = useState([]);
    const [yearly, setYearly] = useState([]);
    const [categoryData, setCategoryData] = useState([]);

    const [view, setView] = useState("monthly");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    
    const COLORS = ["#0d6efd", "#198754", "#dc3545", "#ffc107", "#6f42c1", "#20c997", "#fd7e14"];
    const theme = localStorage.getItem("theme");
    const isDark = theme === "dark";

    const loadData = async () => {
        try {
            const [m, y, c] = await Promise.all([
                API.get("/monthly-report"),
                API.get("/yearly-report"),
                API.get("/analytics/category")
            ]);

            const monthlyData = Object.keys(m.data).map((key) => ({
                month: key,
                income: m.data[key].income || 0,
                expense: m.data[key].expense || 0,
                savings: (m.data[key].income || 0) - (m.data[key].expense || 0)
            }));

            const yearlyData = Object.keys(y.data).map((key) => ({
                year: key,
                amount: y.data[key]
            }));

            const catData = Object.keys(c.data).map((key) => ({
                name: key,
                value: c.data[key]
            }));

            setMonthly(monthlyData);
            setYearly(yearlyData);
            setCategoryData(catData);
        } catch {
            toast.error("Failed to load reports ❌");
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const exportPDF = () => {
        exportFinancePDF(monthly, yearly, categoryData);
    };

    const format = (val) => new Intl.NumberFormat("en-IN").format(val);

    return (
        <div className={`container-fluid py-4`} style={{ minHeight: "100vh" }}>
            
            {/* HEADER */}
            <div className="row align-items-center mb-4 g-3">
                <div className="col-12 col-md-6">
                    <h3 className="fw-bold d-flex align-items-center gap-2 mb-1">
                        <BarChart3 className="text-primary" /> Reports
                    </h3>
                    <p className="text-muted mb-0">Financial insights and performance tracking</p>
                </div>
                <div className="col-12 col-md-6 text-md-end">
                    <button className="btn btn-success shadow-sm d-inline-flex align-items-center gap-2 px-3 py-2" onClick={exportPDF}>
                        <FileDown size={18} /> Export PDF
                    </button>
                </div>
            </div>

            {/* CONTROLS & FILTERS */}
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: "15px", background: isDark ? "#1e293b" : "#fff" }}>
                <div className="card-body p-3">
                    <div className="row align-items-center g-3">
                        <div className="col-12 col-lg-4">
                            <div className="btn-group w-100 shadow-sm" role="group">
                                <button
                                    className={`btn py-2 ${view === "monthly" ? "btn-primary" : "btn-outline-primary"}`}
                                    onClick={() => setView("monthly")}
                                >
                                    Monthly Trends
                                </button>
                                <button
                                    className={`btn py-2 ${view === "yearly" ? "btn-primary" : "btn-outline-primary"}`}
                                    onClick={() => setView("yearly")}
                                >
                                    Yearly Growth
                                </button>
                            </div>
                        </div>
                        <div className="col-12 col-lg-8">
                            <div className="d-flex align-items-center gap-2 flex-wrap flex-md-nowrap">
                                <div className="input-group">
                                    <span className="input-group-text bg-transparent border-end-0"><Calendar size={16} /></span>
                                    <input type="date" className="form-control border-start-0" value={from} onChange={(e) => setFrom(e.target.value)} />
                                </div>
                                <span className="text-muted d-none d-md-block">to</span>
                                <div className="input-group">
                                    <span className="input-group-text bg-transparent border-end-0"><Calendar size={16} /></span>
                                    <input type="date" className="form-control border-start-0" value={to} onChange={(e) => setTo(e.target.value)} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CHARTS SECTION */}
            <div className="row g-4">
                {/* PRIMARY CHART (Line or Bar) */}
                <div className="col-12 col-xl-8">
                    <div className="card border-0 shadow-sm h-100" 
                         style={{ borderRadius: "20px", background: isDark ? "#1e293b" : "#fff" }}>
                        <div className="card-body p-4">
                            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                                {view === "monthly" ? <TrendingUp size={20} className="text-success" /> : <BarChart3 size={20} className="text-primary" />}
                                {view === "monthly" ? "Monthly Cashflow" : "Yearly Accumulation"}
                            </h5>
                            
                            <div style={{ width: "100%", height: 350 }}>
                                <ResponsiveContainer>
                                    {view === "monthly" ? (
                                        <LineChart data={monthly} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#334155" : "#f1f5f9"} />
                                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                            <Tooltip 
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: isDark ? '#1e293b' : '#fff', color: isDark ? '#fff' : '#000' }}
                                            />
                                            <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                            <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                            <Line type="monotone" dataKey="savings" stroke="#3b82f6" strokeWidth={3} strokeDasharray="5 5" />
                                        </LineChart>
                                    ) : (
                                        <BarChart data={yearly} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#334155" : "#f1f5f9"} />
                                            <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                            <Tooltip 
                                                cursor={{fill: isDark ? '#334155' : '#f8fafc'}}
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            />
                                            <Bar dataKey="amount" fill="#22c55e" radius={[6, 6, 0, 0]} barSize={40} />
                                        </BarChart>
                                    )}
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CATEGORY BREAKDOWN (Pie) */}
                <div className="col-12 col-xl-4">
                    <div className="card border-0 shadow-sm h-100" 
                         style={{ borderRadius: "20px", background: isDark ? "#1e293b" : "#fff" }}>
                        <div className="card-body p-4">
                            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                                <PieIcon size={20} className="text-info" /> Expense Split
                            </h5>
                            
                            <div style={{ width: "100%", height: 350 }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            label={false}
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            formatter={(value) => [`₹${format(value)}`, 'Spent']}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                        <Legend verticalAlign="bottom" height={36}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .form-control:focus {
                    border-color: #0d6efd;
                    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.08);
                }
                .btn-group .btn {
                    font-weight: 500;
                    transition: all 0.2s;
                }
                @media (max-width: 768px) {
                    .container-fluid { padding-left: 15px; padding-right: 15px; }
                    h3 { font-size: 1.4rem; }
                    .card-body { padding: 1.25rem !important; }
                }
            `}</style>
        </div>
    );
}

export default Reports;
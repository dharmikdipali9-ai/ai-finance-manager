import { useEffect, useState } from "react";
import API from "../services/api";
import { toast } from "react-toastify";
import { 
    BrainCircuit, 
    TrendingUp, 
    TrendingDown, 
    Wallet, 
    BarChart3, 
    PieChart as PieIcon, 
    Sparkles, 
    AlertCircle, 
    CheckCircle2 
} from "lucide-react";

import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement
);

const format = (val) => new Intl.NumberFormat("en-IN").format(val);

function Insights() {
    const [data, setData] = useState({});
    const [categoryData, setCategoryData] = useState({});
    const [monthlyData, setMonthlyData] = useState({});

    const loadData = async () => {
        try {
            const [res1, res2, res3] = await Promise.all([
                API.get("/ai-insights"),
                API.get("/analytics/category"),
                API.get("/analytics/monthly")
            ]);
            setData(res1.data);
            setCategoryData(res2.data);
            setMonthlyData(res3.data);
        } catch {
            toast.error("Failed to load insights ❌");
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const pieData = {
        labels: Object.keys(categoryData),
        datasets: [{
            data: Object.values(categoryData),
            backgroundColor: ["#22c55e", "#ef4444", "#3b82f6", "#facc15", "#a855f7", "#f97316"],
            hoverOffset: 15,
            borderWidth: 2,
            borderColor: "#ffffff"
        }],
    };

    const barData = {
        labels: ["Income", "Expense"],
        datasets: [{
            label: "Total Amount",
            data: [data.income || 0, data.expense || 0],
            backgroundColor: ["#22c55e", "#ef4444"],
            borderRadius: 10,
            barThickness: 40,
        }],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } }
        }
    };

    return (
        <div className="container-fluid py-4" style={{minHeight: "100vh" }}>
            
            {/* HEADER */}
            <div className="mb-4 px-2">
                <div className="d-flex align-items-center gap-3">
                    <div className="p-3 bg-primary bg-opacity-10 rounded-4">
                        <BrainCircuit className="text-primary" size={32} />
                    </div>
                    <div>
                        <h3 className="fw-bold mb-0">AI Insights</h3>
                        <p className="text-muted mb-0">Smart analysis of your financial behavior</p>
                    </div>
                </div>
            </div>

            {/* SUMMARY CARDS */}
            <div className="row g-3 mb-4">
                {[
                    { title: "Income", value: data.income, color: "success", icon: <TrendingUp size={20}/> },
                    { title: "Expense", value: data.expense, color: "danger", icon: <TrendingDown size={20}/> },
                    { title: "Balance", value: data.balance, color: "primary", icon: <Wallet size={20}/> },
                    { title: "Top Category", value: data.top_category, color: "warning", icon: <BarChart3 size={20}/> }
                ].map((item, i) => (
                    <div key={i} className="col-12 col-sm-6 col-md-3">
                        <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "20px" }}>
                            <div className="card-body p-4">
                                <div className={`d-inline-flex p-2 rounded-3 mb-3 bg-${item.color} bg-opacity-10 text-${item.color}`}>
                                    {item.icon}
                                </div>
                                <h6 className="text-muted fw-semibold small text-uppercase mb-1">{item.title}</h6>
                                <h4 className={`fw-bold mb-0 text-${item.color}`}>
                                    {item.title === "Top Category" ? (item.value || "None") : `₹${format(item.value || 0)}`}
                                </h4>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* CHARTS */}
            <div className="row g-4 mb-4">
                <div className="col-12 col-lg-7">
                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "24px" }}>
                        <div className="card-body p-4">
                            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                                <BarChart3 size={20} className="text-primary" /> Cash Flow Overview
                            </h5>
                            <div style={{ height: "300px" }}>
                                <Bar data={barData} options={chartOptions} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-lg-5">
                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "24px" }}>
                        <div className="card-body p-4">
                            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                                <PieIcon size={20} className="text-primary" /> Spending Split
                            </h5>
                            <div style={{ height: "300px" }}>
                                {Object.keys(categoryData).length > 0 ? (
                                    <Pie data={pieData} options={chartOptions} />
                                ) : (
                                    <div className="d-flex align-items-center justify-content-center h-100">
                                        <p className="text-muted">No data available</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* PREDICTION */}
            <div className="card border-0 shadow-lg mb-4 text-white overflow-hidden" 
                style={{ 
                    borderRadius: "24px", 
                    background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                    boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4)"
                }}>
                <div className="card-body p-4 position-relative">
                    <Sparkles className="position-absolute end-0 top-0 m-4 opacity-25" size={60} />
                    <div className="position-relative">
                        <h5 className="fw-bold mb-2 d-flex align-items-center gap-2">
                            <Sparkles size={20} /> AI Future Prediction
                        </h5>
                        <p className="mb-0 fs-5" style={{ lineHeight: "1.6", maxWidth: "90%" }}>
                            {data.prediction || "Start tracking to see your financial future."}
                        </p>
                    </div>
                </div>
            </div>

            {/* INSIGHTS GRID */}
            <h5 className="fw-bold mb-3 px-2">Detailed Observations</h5>
            <div className="row g-3">
                {data.insights && data.insights.length > 0 ? (
                    data.insights.map((insight, i) => {
                        let isWarning = insight.includes("⚠️") || insight.includes("❌");
                        let isSuccess = insight.includes("💰");
                        let colorClass = isWarning ? "danger" : isSuccess ? "success" : "primary";
                        let Icon = isWarning ? AlertCircle : isSuccess ? CheckCircle2 : Sparkles;

                        return (
                            <div key={i} className="col-12 col-md-6">
                                <div className="card border-0 shadow-sm h-100" 
                                    style={{ 
                                        borderRadius: "18px",
                                        borderLeft: `6px solid var(--bs-${colorClass})`
                                    }}>
                                    <div className="card-body d-flex align-items-start gap-3 p-3">
                                        <div className={`mt-1 text-${colorClass}`}>
                                            <Icon size={22} />
                                        </div>
                                        <p className="mb-0 fw-medium" style={{ fontSize: "0.95rem" }}>
                                            {insight}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-12 text-center py-5">
                        <div className="bg-white d-inline-block p-4 rounded-circle shadow-sm mb-3">
                            <BarChart3 size={40} className="text-muted opacity-25" />
                        </div>
                        <h6 className="fw-bold text-muted">Gathering data...</h6>
                        <p className="text-muted small">Your AI insights will appear here soon.</p>
                    </div>
                )}
            </div>

            <style>{`
                .card { transition: transform 0.2s ease; }
                .card:hover { transform: translateY(-2px); }
                @media (max-width: 576px) {
                    h3 { font-size: 1.5rem; }
                    .card-body { padding: 1.25rem !important; }
                    .fs-5 { font-size: 1rem !important; }
                }
            `}</style>
        </div>
    );
}

export default Insights;
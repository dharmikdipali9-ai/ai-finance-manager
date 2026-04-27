import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import API from "../services/api";
import { toast } from "react-toastify";
import AmountInput from "../components/AmountInput";
import { Plus, Trash2, User, Landmark, AlertCircle } from "lucide-react";

function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [form, setForm] = useState({ holder: "", name: "", balance: "" });
  const location = useLocation();
  const [editModal, setEditModal] = useState(false);
  const [kycFile, setKycFile] = useState(null);
  const [editData, setEditData] = useState(null);

  const [editForm, setEditForm] = useState({
    name: "",
    amount: ""
  });


  const banks = [
    { name: "State Bank of India", short: "SBI", logo: "/banks/sbi.png" },
    { name: "HDFC Bank", short: "HDFC", logo: "/banks/hdfc.png" },
    { name: "ICICI Bank", short: "ICICI", logo: "/banks/icici.png" },
    { name: "Axis Bank", short: "Axis", logo: "/banks/axis.png" },
    { name: "Kotak Mahindra Bank", short: "Kotak", logo: "/banks/kotak.png" },
    { name: "Bank of Baroda", short: "BOB", logo: "/banks/bob.png" },
    { name: "Punjab National Bank", short: "PNB", logo: "/banks/pnb.png" },
    { name: "Canara Bank", short: "Canara", logo: "/banks/canara.png" },
    { name: "Union Bank of India", short: "Union", logo: "/banks/union.png" },
    { name: "IDFC FIRST Bank", short: "IDFC", logo: "/banks/idfc.png" },
    { name: "Yes Bank", short: "YES", logo: "/banks/yes.png" },
    { name: "IndusInd Bank", short: "IndusInd", logo: "/banks/induslnd.png" },
    { name: "AU Small Finance Bank", short: "AU", logo: "/banks/au.png" },
    { name: "Paytm Payments Bank", short: "Paytm", logo: "/banks/paytm.png" },
    { name: "Other Bank", short: "Other", logo: "https://cdn-icons-png.flaticon.com/512/2830/2830284.png" }
  ];


  const openEditModal = (account) => {
    setEditData(account);

    setEditForm({
      name: account.type,   // original name
      amount: ""
    });

    setKycFile(null);
    setEditModal(true);
  };

  const updateAccount = async () => {
    if (!editForm.amount || Number(editForm.amount) <= 0) {
      toast.warning("Enter valid deposit amount ⚠️");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("amount", editForm.amount);
      formData.append("name", editForm.name);

      if (editForm.name !== editData.type) {
        if (!kycFile) {
          toast.warning("Please upload KYC document ⚠️");
          return;
        }
        formData.append("kyc", kycFile);
      }

      await API.put(`/account/${editData.id}`, formData);

      toast.success("Account updated successfully ✅");
      setEditModal(false);
      getAccounts();

    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed ❌");
    }
  };

  const getBank = (name) => banks.find((b) => b.name === name);

  const getAccounts = async () => {
    try {
      const res = await API.get("/accounts");
      setAccounts(res.data);
    } catch {
      toast.error("Failed to load accounts ❌");
    }
  };

  useEffect(() => {
    getAccounts();
  }, [location.pathname]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addAccount = async () => {
    if (!form.holder || !form.name || !form.balance) {
      return toast.warning("Please fill all fields ⚠️");
    }
    try {
      await API.post("/account", {
        name: form.name,
        type: form.holder,
        balance: Number(form.balance)
      });
      toast.success("Account Added ✅");
      setForm({ holder: "", name: "", balance: "" });
      getAccounts();
    } catch {
      toast.error("Failed to add account ❌");
    }
  };

  const deleteAccount = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this account?");
    if (!confirmDelete) return;

    try {
      await API.delete(`/account/${id}`);
      toast.success("Deleted ✅");
      getAccounts();
    } catch {
      toast.error("Delete failed ❌");
    }
  };
  const isNameChanged =
    editData && editForm.name !== editData.type;

  return (
    <div className="container-fluid px-4 py-3" style={{ minHeight: "100vh" }}>

      {/* HEADER */}
      <div className="mb-4">
        <h3 className="fw-bold d-flex align-items-center gap-2">
          <Landmark size={28} className="text-primary" /> Accounts
        </h3>
        <p className="text-muted small">Manage your bank balances and financial connections</p>
      </div>

      {/* ADD ACCOUNT SECTION */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: "20px", overflow: "visible" }}>
        <div className="card-header border-0 pt-4 px-4">
          <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
            <Plus size={20} className="text-success" /> Add New Account
          </h5>
        </div>
        <div className="card-body p-4">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label small fw-bold text-muted">Account Holder</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-0"><User size={16} /></span>
                <input
                  name="holder"
                  placeholder="Full Name"
                  className="form-control border-0 bg-light"
                  value={form.holder}
                  onChange={handleChange}
                  style={{ borderRadius: "0 10px 10px 0" }}
                />
              </div>
            </div>

            <div className="col-md-4">
              <label className="form-label small fw-bold text-muted">Select Bank</label>
              <div className="position-relative">
                <div
                  className="form-control border-0 bg-light d-flex justify-content-between align-items-center"
                  style={{ cursor: "pointer", borderRadius: "10px", height: "46px" }}
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  {form.name ? (
                    <div className="d-flex align-items-center gap-2">
                      <img
                        src={getBank(form.name)?.logo}
                        alt=""
                        style={{ width: "24px", height: "24px", objectFit: "contain" }}
                        onError={(e) => { e.target.src = "https://cdn-icons-png.flaticon.com/512/2830/2830284.png"; }}
                      />
                      <span className="fw-medium">{form.name}</span>
                    </div>
                  ) : (
                    <span className="text-muted">Choose a bank...</span>
                  )}
                  <span className={`dropdown-toggle ${showDropdown ? 'show' : ''}`}></span>
                </div>

                {showDropdown && (
                  <div
                    className="position-absolute w-100 bg-white shadow-lg mt-2 border-0"
                    style={{ zIndex: 1000, borderRadius: "12px", maxHeight: "250px", overflowY: "auto" }}
                  >
                    {banks.map((b, i) => (
                      <div
                        key={i}
                        className="d-flex justify-content-between align-items-center p-3 border-bottom list-item-hover"
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          // CRITICAL: Update the name to match the bank name exactly
                          setForm({ ...form, name: b.name });
                          setShowDropdown(false);
                        }}
                      >
                        <div className="d-flex flex-column">
                          <span className="small fw-bold">{b.short}</span>
                          <span className="text-muted" style={{ fontSize: '11px' }}>{b.name}</span>
                        </div>
                        <img
                          src={b.logo}
                          alt={b.name}
                          style={{ width: "24px", height: "24px", objectFit: "contain" }}
                          onError={(e) => { e.target.src = "https://cdn-icons-png.flaticon.com/512/2830/2830284.png"; }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="col-md-2">
              <label className="form-label small fw-bold text-muted">Opening Balance</label>
              <div className="position-relative">
                <AmountInput
                  value={form.balance}
                  onChange={(val) => setForm({ ...form, balance: val })}
                  placeholder="0.00"
                  className="form-control border-0 bg-light fw-bold"
                  style={{ borderRadius: "10px", paddingLeft: "35px", height: "46px" }}
                />
                <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b", fontWeight: "600" }}>₹</span>
              </div>
            </div>

            <div className="col-md-2">
              <button
                className="btn btn-primary w-100 fw-bold border-0"
                onClick={addAccount}
                style={{ height: "46px", borderRadius: "10px", background: "linear-gradient(45deg, #0d6efd, #0b5ed7)" }}
              >
                Add Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ACCOUNT LIST SECTION */}
      <h5 className="fw-bold mb-3 px-1">Your Connected Accounts</h5>
      <div className="row g-4">
        {accounts.length > 0 ? (
          accounts.map((a) => {
            const bank = getBank(a.name);
            return (
              <div className="col-lg-4 col-md-6" key={a.id}>
                <div
                  className="card border-0 shadow-sm account-card h-100"
                  style={{ borderRadius: "20px", transition: "transform 0.2s" }}
                >
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className="p-2 bg-white shadow-sm border" style={{ borderRadius: "12px" }}>
                          <img
                            src={bank?.logo}
                            alt={bank?.name}
                            onError={(e) => { e.target.src = "https://cdn-icons-png.flaticon.com/512/2830/2830284.png"; }}
                            style={{ width: "32px", height: "32px", objectFit: "contain" }}
                          />
                        </div>
                        <div>
                          <h6 className="fw-bold mb-0">{bank?.short || a.name}</h6>
                          <span className="text-muted" style={{ fontSize: "11px", fontWeight: "600", textTransform: "uppercase" }}>
                            {a.name.length > 15 ? a.name.substring(0, 15) + '...' : a.name}
                          </span>
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => openEditModal(a)}
                        >
                          Edit
                        </button>

                        <button
                          className="btn btn-link text-danger p-0 border-0"
                          onClick={() => deleteAccount(a.id)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="bg-light p-3 rounded-4 mb-3">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <User size={14} className="text-muted" />
                        <span className="text-muted fw-medium" style={{ fontSize: "13px" }}>{a.type}</span>
                      </div>
                      <h3 className={`fw-bold mb-0 ${a.balance < 0 ? "text-danger" : "text-primary"}`}>
                        ₹ {new Intl.NumberFormat("en-IN").format(a.balance)}
                      </h3>
                    </div>

                    {a.balance < 1000 && (
                      <div className="d-flex align-items-center gap-2 text-danger small fw-bold animate-pulse">
                        <AlertCircle size={14} /> Low balance alert
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-12 text-center py-5">
            <Landmark size={48} className="text-light mb-2" />
            <p className="text-muted">No accounts added yet. Start by adding one above.</p>
          </div>
        )}
      </div>
      {editModal && editData && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content p-3">

              <h5 className="mb-3">Edit Account</h5>

              {/* NAME */}
              <label>Account Holder Name</label>
              <input
                className="form-control mb-2"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
              />

              {/* AMOUNT */}
              <label>Deposit Amount</label>
              <input
                type="number"
                className="form-control mb-2"
                value={editForm.amount}
                onChange={(e) =>
                  setEditForm({ ...editForm, amount: e.target.value })
                }
              />

              {/* ⚠️ WARNING */}
              {isNameChanged && (
                <div className="alert alert-warning small">
                  ⚠️ Changing account holder name requires KYC verification
                </div>
              )}

              {/* 📄 KYC FIELD (NOW IT WILL DEFINITELY SHOW) */}
              {isNameChanged && (
                <>
                  <label>KYC Document (Aadhar / PAN)</label>
                  <input
                    type="file"
                    className="form-control mb-3"
                    onChange={(e) => setKycFile(e.target.files[0])}
                  />
                </>
              )}

              <div className="d-flex justify-content-end gap-2">
                <button
                  className="btn btn-secondary"
                  onClick={() => setEditModal(false)}
                >
                  Cancel
                </button>

                <button
                  className="btn btn-primary"
                  onClick={updateAccount}
                  disabled={
                    !editForm.amount ||
                    Number(editForm.amount) <= 0 ||
                    (isNameChanged && !kycFile)
                  }
                >
                  Save
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      <style>{`
        .list-item-hover:hover { background-color: #f1f5f9; }
        .account-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.05) !important; }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
        .input-group-text { border-radius: 10px 0 0 10px; }
      `}</style>
    </div>
  );
}

export default Accounts;
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

  // ✅ NEW STATES (SAFE)
  const [showModal, setShowModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", amount: "", kyc: null });
  const [showKYC, setShowKYC] = useState(false);

  const location = useLocation();

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

  // ✅ DELETE CONFIRM
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

  // ✅ OPEN MODAL
  const openEditModal = (account) => {
    setSelectedAccount(account);
    setEditForm({
      name: account.name,
      amount: "",
      kyc: null
    });
    setShowKYC(false);
    setShowModal(true);
  };

  // ✅ UPDATE ACCOUNT
  const handleUpdate = async () => {
    if (!editForm.amount) return toast.error("Enter amount");

    const isSameName = editForm.name === selectedAccount.name;

    if (!isSameName && !editForm.kyc) {
      toast.warning("Upload KYC to change name");
      setShowKYC(true);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", editForm.name);
      formData.append("amount", editForm.amount);

      if (editForm.kyc) formData.append("kyc", editForm.kyc);

      await API.put(`/account/${selectedAccount.id}`, formData);

      toast.success("Updated ✅");
      setShowModal(false);
      getAccounts();
    } catch {
      toast.error("Update failed ❌");
    }
  };

  return (
    <div className="container-fluid px-4 py-3" style={{ minHeight: "100vh" }}>

      {/* HEADER */}
      <div className="mb-4">
        <h3 className="fw-bold d-flex align-items-center gap-2">
          <Landmark size={28} className="text-primary" /> Accounts
        </h3>
        <p className="text-muted small">Manage your bank balances and financial connections</p>
      </div>

      {/* ADD ACCOUNT SECTION (UNCHANGED) */}
      {/* ... keep your existing code here exactly same ... */}

      {/* ACCOUNT LIST */}
      <div className="row g-4">
        {accounts.length > 0 ? (
          accounts.map((a) => {
            const bank = getBank(a.name);
            return (
              <div className="col-lg-4 col-md-6" key={a.id}>
                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "20px" }}>
                  <div className="card-body p-4">

                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex align-items-center gap-3">
                        <img src={bank?.logo} style={{ width: 32 }} alt="" />
                        <div>
                          <h6 className="fw-bold mb-0">{bank?.short || a.name}</h6>
                          <small className="text-muted">{a.name}</small>
                        </div>
                      </div>

                      {/* ✅ EDIT + DELETE */}
                      <div className="d-flex gap-2">
                        <button onClick={() => openEditModal(a)}>✏️</button>
                        <button onClick={() => deleteAccount(a.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <h3 className={a.balance < 0 ? "text-danger" : "text-primary"}>
                      ₹ {a.balance}
                    </h3>

                    {/* ✅ KYC STATUS */}
                    <p className="small fw-bold mt-2">
                      KYC:
                      <span className={
                        a.kyc_status === "Verified"
                          ? "text-success ms-1"
                          : a.kyc_status === "Pending"
                          ? "text-warning ms-1"
                          : "text-danger ms-1"
                      }>
                        {a.kyc_status || "Not Submitted"}
                      </span>
                    </p>

                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p>No accounts</p>
        )}
      </div>

      {/* ✅ MODAL */}
      {showModal && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content p-4">
              <h5>Edit Account</h5>

              <input
                className="form-control mb-2"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />

              <input
                type="number"
                className="form-control mb-2"
                placeholder="Amount"
                onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
              />

              {showKYC && (
                <input
                  type="file"
                  className="form-control mb-2"
                  onChange={(e) =>
                    setEditForm({ ...editForm, kyc: e.target.files[0] })
                  }
                />
              )}

              <button className="btn btn-primary" onClick={handleUpdate}>
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Accounts;
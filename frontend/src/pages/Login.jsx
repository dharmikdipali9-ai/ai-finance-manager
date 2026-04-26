import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';
import API from "../services/api";
import { useApp } from "../context/AppContext";

function Auth() {
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [step, setStep] = useState(1);
  const [timer, setTimer] = useState(0);

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    otp: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔐 Password strength
  const getStrength = (password) => {
    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) {
      return { label: "Weak", color: "#ef4444", width: "33%" };
    } else if (score === 3 || score === 4) {
      return { label: "Medium", color: "#f59e0b", width: "66%" };
    } else {
      return { label: "Strong", color: "#22c55e", width: "100%" };
    }
  };

  const strength = getStrength(form.password);

  // ⏳ OTP Timer
  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // 🔐 LOGIN

  const { loadUser } = useApp();
  const loginUser = async () => {
    if (!form.email || !form.password) return alert("Fill all fields");

    setIsLoading(true);
    try {
      const res = await API.post("/login", {
        email: form.email,
        password: form.password
      });

      localStorage.setItem("token", res.data.token);
      await loadUser();   // 🔥 THIS LINE FIXES EVERYTHING

      navigate("/dashboard");
    } catch {
      alert("Login failed ❌");
    } finally {
      setIsLoading(false);
    }
  };

  // 📩 REGISTER - SEND OTP
  const sendOTP = async () => {
    if (!form.name || !form.email || !form.mobile || !form.password) {
      return alert("All fields required");
    }

    if (!/^\d{10}$/.test(form.mobile)) {
      return alert("Mobile must be 10 digits");
    }

    setIsLoading(true);
    try {
      await API.post("/register", form);
      alert("OTP sent 📩");
      setStep(2);
      setTimer(30);
    } catch {
      alert("Failed ❌");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
    setIsLoading(true);
    try {
      await API.post("/verify-otp", {
        email: form.email,
        otp: form.otp
      });

      alert("Account created 🎉");
      setIsRegister(false);
      setStep(1);
    } catch {
      alert("Invalid OTP ❌");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔑 FORGOT PASSWORD FLOW

  const sendResetOTP = async () => {
    if (!form.email) return alert("Enter email");

    setIsLoading(true);
    try {
      await API.post("/forgot-password", { email: form.email });
      alert("OTP sent 📩");
      setStep(2);
      setTimer(30);
    } catch {
      alert("Failed ❌");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyResetOTP = async () => {
    setIsLoading(true);
    try {
      await API.post("/verify-reset-otp", {
        email: form.email,
        otp: form.otp
      });

      alert("OTP verified ✅");
      setStep(3);
    } catch {
      alert("Invalid OTP ❌");
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async () => {
    if (form.password !== form.confirmPassword) {
      return alert("Passwords do not match ❌");
    }

    setIsLoading(true);
    try {
      await API.post("/reset-password", {
        email: form.email,
        newPassword: form.password
      });

      alert("Password reset successful 🔐");
      setForgotMode(false);
      setStep(1);
    } catch {
      alert("Error ❌");
    } finally {
      setIsLoading(false);
    }
  };


  
  return (
    <div
      className="min-vh-100 d-flex align-items-center"
      style={{
        background: "linear-gradient(135deg,#eef2f7,#dbeafe)",
        fontFamily: "Inter, sans-serif"
      }}
    >
      <div className="row w-100 m-0">

        {/* LEFT IMAGE */}
        <div className="col-md-6 d-none d-md-block p-0 position-relative">
          <img
            src="header.jpeg"
            alt="finance"
            style={{
              width: "100%",
              height: "100vh",
              objectFit: "cover"
            }}
          />
          {/* Overlay */}
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg,rgba(0,0,0,0.4),rgba(0,0,0,0.1))"
          }} />
        </div>

        {/* RIGHT FORM */}
        <div className="col-md-6 d-flex justify-content-center align-items-center">
          <div
            className="p-4 shadow-lg border-0"
            style={{
              maxWidth: "420px",
              width: "100%",
              borderRadius: "20px",
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
            }}
          >

            {/* HEADER */}
            <div className="text-center mb-4">
              <div
                style={{
                  width: 55,
                  height: 55,
                  borderRadius: "50%",
                  background: "#2563eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "auto"
                }}
              >
                <Lock size={26} color="white" />
              </div>

              <h3 className="fw-bold mt-3">
                {forgotMode
                  ? "Reset Password"
                  : isRegister
                    ? "Create Account"
                    : "Welcome Back"}
              </h3>

              <small className="text-muted" style={{
                letterSpacing: 1
              }}>
                Manage your finances smartly 🚀
              </small>
            </div>

            {/* REGISTER EXTRA */}
            {isRegister && step === 1 && !forgotMode && (
              <>
                <input
                  name="name"
                  placeholder="Full Name"
                  className="form-control mb-3"
                  onChange={handleChange}
                />
                <input
                  name="mobile"
                  placeholder="Mobile"
                  className="form-control mb-3"
                  onChange={handleChange}
                />
              </>
            )}

            {/* EMAIL */}
            <div className="input-group mb-3">
              <span className="input-group-text bg-white">
                <Mail size={16} />
              </span>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="Email address"
                onChange={handleChange}
              />
            </div>

            {/* PASSWORD */}
            {step === 1 && !forgotMode && (
              <>
                <div className="input-group mb-2">
                  <span className="input-group-text bg-white">
                    <Lock size={16} />
                  </span>

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="form-control"
                    placeholder="Password"
                    onChange={handleChange}
                  />

                  <span
                    className="input-group-text bg-white"
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </span>
                </div>

                {/* Strength */}
                {/* Strength */}
                {isRegister && form.password && (
                  <>
                    <div style={{ height: "6px", background: "#eee", borderRadius: "10px" }}>
                      <div
                        style={{
                          width: strength.width,
                          height: "6px",
                          background: strength.color,
                          borderRadius: "10px",
                          transition: "0.3s"
                        }}
                      />
                    </div>
                    <small style={{ color: strength.color }}>
                      {strength.label} password
                    </small>
                  </>
                )}

                {!isRegister && (
                  <p
                    className="text-end small mt-2"
                    style={{ cursor: "pointer", color: "#2563eb" , letterSpacing: 1}}
                    onClick={() => {
                      setForgotMode(true);
                      setStep(1);
                    }}
                  >
                    Forgot Password
                  </p>
                )}
              </>
            )}

            {/* OTP */}
            {step === 2 && (
              <>
                <input
                  name="otp"
                  placeholder="Enter OTP"
                  className="form-control mb-3"
                  onChange={handleChange}
                />

                {timer > 0 ? (
                  <small className="text-muted">Resend in {timer}s</small>
                ) : (
                  <p
                    style={{ cursor: "pointer", color: "#2563eb" }}
                    onClick={forgotMode ? sendResetOTP : sendOTP}
                  >
                    Resend OTP
                  </p>
                )}
              </>
            )}

            {/* RESET PASSWORD */}
            {forgotMode && step === 3 && (
              <>
                <input
                  type="password"
                  name="password"
                  placeholder="New Password"
                  className="form-control mb-3"
                  onChange={handleChange}
                />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  className="form-control mb-3"
                  onChange={handleChange}
                />
              </>
            )}

            {/* BUTTON */}
            <button
              className="btn w-100 mt-3"
              disabled={
                isLoading ||
                (isRegister && step === 1 && strength.label !== "Strong")
              }
              style={{
                background:
                  isRegister && step === 1 && strength.label !== "Strong"
                    ? "#2563eb"
                    : "#2563eb",
                color:
                  isRegister && step === 1 && form.password && strength.label !== "Strong"
                    ? "white"
                    : "white",
                borderRadius: "10px",
                padding: "10px",
                fontWeight: "600",
                transition: "0.3s",
                cursor:
                  isRegister && step === 1 && strength.label !== "Strong"
                    ? "not-allowed"
                    : "pointer"
              }}
              onClick={
                forgotMode
                  ? step === 1
                    ? sendResetOTP
                    : step === 2
                      ? verifyResetOTP
                      : resetPassword
                  : isRegister
                    ? step === 1
                      ? sendOTP
                      : verifyOTP
                    : loginUser
              }
            >
              {isLoading ? (
                <Loader2 size={16} className="spin" />
              ) : forgotMode ? (
                step === 1 ? "Send OTP" :
                  step === 2 ? "Verify OTP" : "Reset Password"
              ) : isRegister ? (
                step === 1
                  ? (form.password && strength.label !== "Strong"
                    ? "Weak Password"
                    : "Send OTP")
                  : "Verify & Register"
              ) : (
                "Sign In"
              )}
            </button>

            {/* TOGGLE */}
            {!forgotMode && (
              <p className="text-center mt-4">
                {isRegister ? "Already have account?" : "Don't have account?"}
                <span
                  style={{ cursor: "pointer", color: "#2563eb", marginLeft: "6px", fontWeight: "600" }}
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setStep(1);
                  }}
                >
                  {isRegister ? "Login" : "Register"}
                </span>
              </p>
            )}

            {forgotMode && (
              <p
                className="text-center mt-3"
                style={{ cursor: "pointer", color: "#2563eb" }}
                onClick={() => {
                  setForgotMode(false);
                  setStep(1);
                }}
              >
                Back to Login
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

}

export default Auth;
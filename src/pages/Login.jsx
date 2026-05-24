import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .sl-page {
    font-family: 'DM Sans', sans-serif;
    display: flex;
    min-height: 100vh;
    background: #f0f2f5;
  }

  /* ── LEFT PANEL ── */
  .sl-left {
    width: 370px;
    min-width: 370px;
    background: linear-gradient(160deg, #0a1628 0%, #0d2248 60%, #0f2d6e 100%);
    display: flex;
    flex-direction: column;
    padding: 36px 40px 40px;
    position: relative;
    overflow: hidden;
  }
  .sl-left::before {
    content: '';
    position: absolute;
    top: -80px; right: -80px;
    width: 320px; height: 320px;
    background: radial-gradient(circle, rgba(37,99,235,.35) 0%, transparent 70%);
    pointer-events: none;
  }
  .sl-left::after {
    content: '';
    position: absolute;
    bottom: 160px; left: -60px;
    width: 260px; height: 260px;
    background: radial-gradient(circle, rgba(37,99,235,.2) 0%, transparent 70%);
    pointer-events: none;
  }

  .sl-brand {
    display: flex; align-items: center; gap: 12px;
    position: relative; z-index: 1;
  }
  .sl-brand-icon {
    width: 44px; height: 44px;
    background: rgba(37,99,235,.25);
    border: 1.5px solid rgba(59,130,246,.45);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
  }
  .sl-brand-name { color: #fff; font-size: 16px; font-weight: 700; line-height: 1.2; }
  .sl-brand-sub  { color: rgba(255,255,255,.5); font-size: 11px; letter-spacing: .3px; }

  .sl-left-body { margin-top: 52px; flex: 1; position: relative; z-index: 1; }
  .sl-left-body h1 {
    color: #fff; font-size: 28px; font-weight: 700;
    line-height: 1.25; margin-bottom: 16px;
  }
  .sl-left-body p {
    color: rgba(255,255,255,.6); font-size: 14px;
    line-height: 1.65; margin-bottom: 32px;
  }

  .sl-features { list-style: none; display: flex; flex-direction: column; gap: 14px; }
  .sl-feature-item {
    display: flex; align-items: center; gap: 12px;
    color: rgba(255,255,255,.85); font-size: 13.5px;
  }
  .sl-feat-dot {
    width: 22px; height: 22px; border-radius: 50%;
    background: #2563eb; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
  }

  .sl-illustration {
    margin-top: auto; padding-top: 40px;
    display: flex; justify-content: center;
    position: relative; z-index: 1;
  }
  .sl-iso { width: 260px; height: 160px; position: relative; }
  .sl-platform {
    position: absolute; bottom: 0; left: 50%;
    transform: translateX(-50%);
    width: 220px; height: 60px;
    background: linear-gradient(135deg, #1a3a7a 0%, #0f2655 100%);
    border-radius: 8px; box-shadow: 0 8px 32px rgba(0,0,0,.4);
  }
  .sl-box1 {
    position: absolute; border-radius: 6px;
    width: 54px; height: 54px;
    background: linear-gradient(135deg, #1e4fd8 0%, #1a3fb0 100%);
    bottom: 52px; left: 28px;
    box-shadow: 4px 4px 16px rgba(0,0,0,.3);
    transform: rotate(-8deg);
  }
  .sl-box2 {
    position: absolute; border-radius: 6px;
    width: 40px; height: 40px;
    background: linear-gradient(135deg, #2d6be4 0%, #1d52c4 100%);
    bottom: 82px; left: 60px;
    transform: rotate(6deg);
  }
  .sl-screen {
    position: absolute; bottom: 52px; right: 20px;
    width: 110px; height: 72px;
    background: linear-gradient(160deg, #1a3a80 0%, #0e224e 100%);
    border-radius: 6px; border: 1.5px solid rgba(59,130,246,.3);
    overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,.4);
    padding: 8px 10px 0;
  }
  .sl-screen-line {
    height: 3px; border-radius: 2px; margin-bottom: 4px;
    background: rgba(59,130,246,.5);
  }
  .sl-screen-line.short { width: 55%; }
  .sl-bars { display: flex; gap: 5px; align-items: flex-end; margin-top: 6px; }
  .sl-bar { width: 12px; border-radius: 2px 2px 0 0; background: rgba(59,130,246,.6); }

  /* ── RIGHT PANEL ── */
  .sl-right {
    flex: 1; display: flex; align-items: center;
    justify-content: center; padding: 40px 24px;
    background: #f0f2f5;
  }

  .sl-card {
    background: #fff; border-radius: 16px;
    box-shadow: 0 4px 32px rgba(0,0,0,.09);
    padding: 44px 48px 40px;
    width: 100%; max-width: 460px;
  }

  .sl-card-header { text-align: center; margin-bottom: 32px; }
  .sl-card-header h2 { font-size: 24px; font-weight: 700; color: #0d1b3e; }
  .sl-card-header p  { font-size: 14px; color: #6b7a99; margin-top: 6px; }

  .sl-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 18px; }
  .sl-field label { font-size: 13px; font-weight: 600; color: #1e293b; }

  .sl-input-wrap { position: relative; display: flex; align-items: center; }
  .sl-input-wrap svg.sl-ico {
    position: absolute; left: 13px; width: 16px; height: 16px;
    color: #9baac6; pointer-events: none; flex-shrink: 0;
  }
  .sl-input-wrap input {
    width: 100%; height: 46px;
    border: 1.5px solid #e2e8f0; border-radius: 8px;
    padding: 0 14px 0 40px;
    font-size: 14px; font-family: inherit; color: #1e293b;
    background: #fff; outline: none;
    transition: border-color .2s, box-shadow .2s;
  }
  .sl-input-wrap input::placeholder { color: #b0bcd4; }
  .sl-input-wrap input:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37,99,235,.12);
  }
  .sl-input-wrap input.sl-error { border-color: #ef4444; }
  .sl-input-wrap input.sl-error:focus { box-shadow: 0 0 0 3px rgba(239,68,68,.12); }

  .sl-toggle-pw {
    position: absolute; right: 12px;
    background: none; border: none; cursor: pointer;
    color: #9baac6; display: flex; align-items: center; padding: 0;
  }
  .sl-toggle-pw svg { width: 18px; height: 18px; }

  .sl-err-msg { font-size: 11.5px; color: #ef4444; margin-top: 3px; }

  .sl-row-inline {
    display: flex; align-items: center;
    justify-content: space-between; margin-bottom: 22px;
  }
  .sl-remember { display: flex; align-items: center; gap: 8px; }
  .sl-remember input[type=checkbox] {
    width: 17px; height: 17px; accent-color: #2563eb; cursor: pointer;
  }
  .sl-remember label { font-size: 13px; color: #6b7a99; cursor: pointer; }
  .sl-forgot { font-size: 13px; font-weight: 600; color: #2563eb; text-decoration: none; }
  .sl-forgot:hover { text-decoration: underline; }

  .sl-btn-primary {
    width: 100%; height: 48px;
    background: #2563eb; color: #fff; border: none;
    border-radius: 8px; font-size: 15px; font-weight: 600;
    font-family: inherit; cursor: pointer;
    transition: background .2s, transform .1s, box-shadow .2s;
    box-shadow: 0 4px 14px rgba(37,99,235,.35);
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .sl-btn-primary:hover:not(:disabled) { background: #1d4fd8; box-shadow: 0 6px 20px rgba(37,99,235,.45); }
  .sl-btn-primary:active:not(:disabled) { transform: translateY(1px); }
  .sl-btn-primary:disabled { opacity: .65; cursor: not-allowed; }

  .sl-spinner {
    width: 18px; height: 18px;
    border: 2.5px solid rgba(255,255,255,.4);
    border-top-color: #fff; border-radius: 50%;
    animation: sl-spin .7s linear infinite;
  }
  @keyframes sl-spin { to { transform: rotate(360deg); } }

  .sl-divider {
    display: flex; align-items: center; gap: 12px;
    margin: 20px 0; color: #b0bcd4; font-size: 13px;
  }
  .sl-divider::before, .sl-divider::after {
    content: ''; flex: 1; height: 1px; background: #e8ecf3;
  }

  .sl-btn-google {
    width: 100%; height: 46px;
    border: 1.5px solid #e2e8f0; border-radius: 8px;
    background: #fff; display: flex; align-items: center;
    justify-content: center; gap: 10px;
    font-size: 14px; font-weight: 600; font-family: inherit;
    color: #1e293b; cursor: pointer;
    transition: border-color .2s, box-shadow .2s;
  }
  .sl-btn-google:hover { border-color: #b0bcd4; box-shadow: 0 2px 8px rgba(0,0,0,.07); }

  .sl-signup-link { text-align: center; margin-top: 22px; font-size: 13.5px; color: #6b7a99; }
  .sl-signup-link a { color: #2563eb; font-weight: 600; text-decoration: none; }
  .sl-signup-link a:hover { text-decoration: underline; }

  /* Forgot password modal */
  .sl-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,.45);
    display: flex; align-items: center; justify-content: center;
    z-index: 100;
    animation: sl-fade-in .15s ease;
  }
  @keyframes sl-fade-in { from { opacity: 0; } to { opacity: 1; } }

  .sl-modal {
    background: #fff; border-radius: 14px;
    padding: 36px 40px 32px;
    width: 100%; max-width: 400px;
    box-shadow: 0 16px 48px rgba(0,0,0,.18);
    animation: sl-slide-up .2s ease;
  }
  @keyframes sl-slide-up { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

  .sl-modal h3 { font-size: 20px; font-weight: 700; color: #0d1b3e; margin-bottom: 8px; }
  .sl-modal p  { font-size: 14px; color: #6b7a99; margin-bottom: 24px; line-height: 1.55; }

  .sl-modal-actions { display: flex; gap: 10px; margin-top: 20px; }
  .sl-btn-secondary {
    flex: 1; height: 44px; border: 1.5px solid #e2e8f0;
    border-radius: 8px; background: #fff; font-size: 14px;
    font-weight: 600; font-family: inherit; color: #1e293b;
    cursor: pointer; transition: border-color .2s;
  }
  .sl-btn-secondary:hover { border-color: #b0bcd4; }

  .sl-modal-success {
    text-align: center; padding: 8px 0 4px;
  }
  .sl-modal-success-icon {
    width: 56px; height: 56px; border-radius: 50%;
    background: #dcfce7; display: flex; align-items: center;
    justify-content: center; margin: 0 auto 16px;
  }
  .sl-modal-success h4 { font-size: 17px; font-weight: 700; color: #0d1b3e; margin-bottom: 8px; }
  .sl-modal-success p  { font-size: 13.5px; color: #6b7a99; line-height: 1.6; }
`;

/* ── SVG helpers ── */
const MailIcon = () => (
  <svg
    className="sl-ico"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <polyline points="2,4 12,13 22,4" />
  </svg>
);

const LockIcon = () => (
  <svg
    className="sl-ico"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EyeIcon = ({ off }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {off ? (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    ) : (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
);

const CheckIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    stroke="#fff"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="2,6 5,9 10,3" />
  </svg>
);

const GoogleG = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908C16.658 14.233 17.64 11.925 17.64 9.2z"
      fill="#4285F4"
    />
    <path
      d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      fill="#34A853"
    />
    <path
      d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
      fill="#FBBC05"
    />
    <path
      d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"
      fill="#EA4335"
    />
  </svg>
);

/* ── Validation ── */
function validate(fields) {
  const errs = {};
  if (!fields.email.trim()) errs.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
    errs.email = "Enter a valid email";
  if (!fields.password) errs.password = "Password is required";
  return errs;
}

/* ── Forgot Password Modal ── */
function ForgotModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await new Promise((res) => setTimeout(res, 1400));
      setSent(true);
      toast.success("Reset token triggered successfully.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="sl-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="sl-modal">
        {sent ? (
          <div className="sl-modal-success">
            <div className="sl-modal-success-icon">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#16a34a"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h4>Check your inbox</h4>
            <p>
              We sent a password reset link to
              <br />
              <strong>{email}</strong>
            </p>
            <button
              className="sl-btn-primary"
              style={{ marginTop: 24 }}
              onClick={onClose}
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <>
            <h3>Forgot password?</h3>
            <p>
              Enter your email and we'll send you a link to reset your password.
            </p>
            <div className="sl-field">
              <label>Email address</label>
              <div className="sl-input-wrap">
                <MailIcon />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  className={error ? "sl-error" : ""}
                  autoFocus
                />
              </div>
              {error && <span className="sl-err-msg">{error}</span>}
            </div>
            <div className="sl-modal-actions">
              <button className="sl-btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                className="sl-btn-primary"
                style={{ flex: 1 }}
                onClick={handleSend}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="sl-spinner" /> Sending…
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Main Component ── */
function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [fields, setFields] = useState({ email: "", password: "" });
  const [remember, setRemember] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("si_remember_email");
    if (rememberedEmail) {
      setFields((f) => ({ ...f, email: rememberedEmail }));
      setRemember(true);
    }
  }, []);

  const set = (key) => (e) => {
    setFields((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => {
      const n = { ...er };
      delete n[key];
      return n;
    });
  };

  const handleSubmit = async () => {
    const errs = validate(fields);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const result = await login(fields.email, fields.password);
      // console.log("Auth System Server Response:", result);

      if (result?.success) {
        if (remember) {
          localStorage.setItem(
            "si_remember_email",
            fields.email.trim().toLowerCase(),
          );
        } else {
          localStorage.removeItem("si_remember_email");
        }

        const userData = result?.user;
        toast.success(`Welcome back, ${userData?.first_name || "User"}!`);
        // console.log(userData)

        const userRole = userData?.role?.toLowerCase();
        
        // 🔀 Active routing configuration based on response data path:
        if (userRole === "admin") {
          navigate("/dashboard");
        } else {
          navigate("/store");
        }
      } else {
        toast.error(
          result?.message || "Invalid credentials combination parameters.",
        );
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Authentication layer connection error.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    toast.info(
      "Google OAuth provider synchronization is pending config setup.",
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <>
      <style>{styles}</style>

      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        theme="colored"
      />

      {showForgot && <ForgotModal onClose={() => setShowForgot(false)} />}

      <div className="sl-page">
        {/* ── LEFT PANEL ── */}
        <aside className="sl-left">
          <div className="sl-brand">
            <div className="sl-brand-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <div className="sl-brand-name">SmartInventory</div>
              <div className="sl-brand-sub">Inventory Management System</div>
            </div>
          </div>

          <div className="sl-left-body">
            <h1>Smart Inventory Management</h1>
            <p>
              Track, manage, and optimize your inventory in real-time.
              Streamline operations and grow your business with SmartInventory.
            </p>
            <ul className="sl-features">
              {[
                "Real-time stock tracking",
                "Low stock alerts",
                "Purchase order management",
                "Comprehensive reports",
              ].map((f) => (
                <li key={f} className="sl-feature-item">
                  <span className="sl-feat-dot">
                    <CheckIcon />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="sl-illustration">
            <div className="sl-iso">
              <div className="sl-platform" />
              <div className="sl-box1" />
              <div className="sl-box2" />
              <div className="sl-screen">
                <div className="sl-screen-line" />
                <div className="sl-screen-line short" />
                <div className="sl-bars">
                  {[18, 28, 22, 32, 14].map((h, i) => (
                    <div key={i} className="sl-bar" style={{ height: h }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ── RIGHT PANEL ── */}
        <main className="sl-right">
          <div className="sl-card">
            <div className="sl-card-header">
              <h2>Welcome back</h2>
              <p>Sign in to your account to continue</p>
            </div>

            {/* Email Field */}
            <div className="sl-field">
              <label>Email address</label>
              <div className="sl-input-wrap">
                <MailIcon />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={fields.email}
                  onChange={set("email")}
                  onKeyDown={handleKeyDown}
                  className={errors.email ? "sl-error" : ""}
                />
              </div>
              {errors.email && (
                <span className="sl-err-msg">{errors.email}</span>
              )}
            </div>

            {/* Password Field */}
            <div className="sl-field">
              <label>Password</label>
              <div className="sl-input-wrap">
                <LockIcon />
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Enter your password"
                  value={fields.password}
                  onChange={set("password")}
                  onKeyDown={handleKeyDown}
                  className={errors.password ? "sl-error" : ""}
                />
                <button
                  className="sl-toggle-pw"
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                >
                  <EyeIcon off={!showPw} />
                </button>
              </div>
              {errors.password && (
                <span className="sl-err-msg">{errors.password}</span>
              )}
            </div>

            {/* Actions Panel */}
            <div className="sl-row-inline">
              <div className="sl-remember">
                <input
                  type="checkbox"
                  id="sl-remember"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <label htmlFor="sl-remember">Remember me</label>
              </div>
              <a
                href="#"
                className="sl-forgot"
                onClick={(e) => {
                  e.preventDefault();
                  setShowForgot(true);
                }}
              >
                Forgot password?
              </a>
            </div>

            {/* Primary Submit Button */}
            <button
              className="sl-btn-primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="sl-spinner" /> Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </button>

            <div className="sl-divider">or</div>

            <button className="sl-btn-google" onClick={handleGoogle}>
              <GoogleG /> Continue with Google
            </button>

            {/* <p className="sl-signup-link">
              Don't have an account? <a href="/signup">Sign up</a>
            </p> */}
          </div>
        </main>
      </div>
    </>
  );
}

export default Login;
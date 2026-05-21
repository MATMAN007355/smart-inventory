import { useState } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .si-page {
    font-family: 'DM Sans', sans-serif;
    display: flex;
    min-height: 100vh;
    background: #f0f2f5;
  }

  /* ── LEFT PANEL ── */
  .si-left {
    width: 370px;
    min-width: 370px;
    background: linear-gradient(160deg, #0a1628 0%, #0d2248 60%, #0f2d6e 100%);
    display: flex;
    flex-direction: column;
    padding: 36px 40px 40px;
    position: relative;
    overflow: hidden;
  }
  .si-left::before {
    content: '';
    position: absolute;
    top: -80px; right: -80px;
    width: 320px; height: 320px;
    background: radial-gradient(circle, rgba(37,99,235,.35) 0%, transparent 70%);
    pointer-events: none;
  }
  .si-left::after {
    content: '';
    position: absolute;
    bottom: 160px; left: -60px;
    width: 260px; height: 260px;
    background: radial-gradient(circle, rgba(37,99,235,.2) 0%, transparent 70%);
    pointer-events: none;
  }

  .si-brand {
    display: flex; align-items: center; gap: 12px;
    position: relative; z-index: 1;
  }
  .si-brand-icon {
    width: 44px; height: 44px;
    background: rgba(37,99,235,.25);
    border: 1.5px solid rgba(59,130,246,.45);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
  }
  .si-brand-name { color: #fff; font-size: 16px; font-weight: 700; line-height: 1.2; }
  .si-brand-sub  { color: rgba(255,255,255,.5); font-size: 11px; letter-spacing: .3px; }

  .si-left-body { margin-top: 52px; flex: 1; position: relative; z-index: 1; }
  .si-left-body h1 {
    color: #fff; font-size: 28px; font-weight: 700;
    line-height: 1.25; margin-bottom: 16px;
  }
  .si-left-body p {
    color: rgba(255,255,255,.6); font-size: 14px;
    line-height: 1.65; margin-bottom: 32px;
  }

  .si-features { list-style: none; display: flex; flex-direction: column; gap: 14px; }
  .si-feature-item {
    display: flex; align-items: center; gap: 12px;
    color: rgba(255,255,255,.85); font-size: 13.5px;
  }
  .si-feat-dot {
    width: 22px; height: 22px; border-radius: 50%;
    background: #2563eb; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
  }

  .si-illustration {
    margin-top: auto; padding-top: 40px;
    display: flex; justify-content: center;
    position: relative; z-index: 1;
  }
  .si-iso { width: 260px; height: 160px; position: relative; }
  .si-platform {
    position: absolute; bottom: 0; left: 50%;
    transform: translateX(-50%);
    width: 220px; height: 60px;
    background: linear-gradient(135deg, #1a3a7a 0%, #0f2655 100%);
    border-radius: 8px; box-shadow: 0 8px 32px rgba(0,0,0,.4);
  }
  .si-box1 {
    position: absolute; border-radius: 6px;
    width: 54px; height: 54px;
    background: linear-gradient(135deg, #1e4fd8 0%, #1a3fb0 100%);
    bottom: 52px; left: 28px;
    box-shadow: 4px 4px 16px rgba(0,0,0,.3);
    transform: rotate(-8deg);
  }
  .si-box2 {
    position: absolute; border-radius: 6px;
    width: 40px; height: 40px;
    background: linear-gradient(135deg, #2d6be4 0%, #1d52c4 100%);
    bottom: 82px; left: 60px;
    transform: rotate(6deg);
  }
  .si-screen {
    position: absolute; bottom: 52px; right: 20px;
    width: 110px; height: 72px;
    background: linear-gradient(160deg, #1a3a80 0%, #0e224e 100%);
    border-radius: 6px; border: 1.5px solid rgba(59,130,246,.3);
    overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,.4);
    padding: 8px 10px 0;
  }
  .si-screen-line {
    height: 3px; border-radius: 2px; margin-bottom: 4px;
    background: rgba(59,130,246,.5);
  }
  .si-screen-line.short { width: 55%; }
  .si-bars { display: flex; gap: 5px; align-items: flex-end; margin-top: 6px; }
  .si-bar { width: 12px; border-radius: 2px 2px 0 0; background: rgba(59,130,246,.6); }

  /* ── RIGHT PANEL ── */
  .si-right {
    flex: 1; display: flex; align-items: center;
    justify-content: center; padding: 40px 24px;
    background: #f0f2f5;
  }

  .si-card {
    background: #fff; border-radius: 16px;
    box-shadow: 0 4px 32px rgba(0,0,0,.09);
    padding: 40px 44px 36px;
    width: 100%; max-width: 490px;
  }

  .si-card-header { text-align: center; margin-bottom: 28px; }
  .si-card-header h2 { font-size: 24px; font-weight: 700; color: #0d1b3e; }
  .si-card-header p  { font-size: 14px; color: #6b7a99; margin-top: 6px; }

  .si-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

  .si-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
  .si-field label { font-size: 13px; font-weight: 600; color: #1e293b; }

  .si-input-wrap { position: relative; display: flex; align-items: center; }
  .si-input-wrap svg.si-ico {
    position: absolute; left: 13px; width: 16px; height: 16px;
    color: #9baac6; pointer-events: none; flex-shrink: 0;
  }
  .si-input-wrap input {
    width: 100%; height: 46px;
    border: 1.5px solid #e2e8f0; border-radius: 8px;
    padding: 0 14px 0 40px;
    font-size: 14px; font-family: inherit; color: #1e293b;
    background: #fff; outline: none;
    transition: border-color .2s, box-shadow .2s;
  }
  .si-input-wrap input::placeholder { color: #b0bcd4; }
  .si-input-wrap input:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37,99,235,.12);
  }
  .si-input-wrap input.si-error { border-color: #ef4444; }
  .si-input-wrap input.si-error:focus { box-shadow: 0 0 0 3px rgba(239,68,68,.12); }

  .si-toggle-pw {
    position: absolute; right: 12px;
    background: none; border: none; cursor: pointer;
    color: #9baac6; display: flex; align-items: center; padding: 0;
  }
  .si-toggle-pw svg { width: 18px; height: 18px; }

  .si-err-msg { font-size: 11.5px; color: #ef4444; margin-top: 3px; }

  .si-pw-bars { display: flex; gap: 4px; margin-top: 7px; margin-bottom: 3px; }
  .si-pw-bar {
    height: 4px; border-radius: 2px; flex: 1;
    background: #e2e8f0; transition: background .3s;
  }
  .si-pw-label { font-size: 11px; color: #9baac6; }

  .si-terms {
    display: flex; align-items: flex-start; gap: 10px; margin-bottom: 20px;
  }
  .si-terms input[type=checkbox] {
    width: 17px; height: 17px; flex-shrink: 0;
    accent-color: #2563eb; cursor: pointer; margin-top: 2px;
  }
  .si-terms label { font-size: 13px; color: #6b7a99; line-height: 1.55; cursor: pointer; }
  .si-terms label a { color: #2563eb; text-decoration: none; font-weight: 500; }

  .si-btn-primary {
    width: 100%; height: 48px;
    background: #2563eb; color: #fff; border: none;
    border-radius: 8px; font-size: 15px; font-weight: 600;
    font-family: inherit; cursor: pointer;
    transition: background .2s, transform .1s, box-shadow .2s;
    box-shadow: 0 4px 14px rgba(37,99,235,.35);
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .si-btn-primary:hover:not(:disabled) { background: #1d4fd8; box-shadow: 0 6px 20px rgba(37,99,235,.45); }
  .si-btn-primary:active:not(:disabled) { transform: translateY(1px); }
  .si-btn-primary:disabled { opacity: .65; cursor: not-allowed; }

  .si-spinner {
    width: 18px; height: 18px; border: 2.5px solid rgba(255,255,255,.4);
    border-top-color: #fff; border-radius: 50%;
    animation: si-spin .7s linear infinite;
  }
  @keyframes si-spin { to { transform: rotate(360deg); } }

  .si-divider {
    display: flex; align-items: center; gap: 12px;
    margin: 18px 0; color: #b0bcd4; font-size: 13px;
  }
  .si-divider::before, .si-divider::after {
    content: ''; flex: 1; height: 1px; background: #e8ecf3;
  }

  .si-btn-google {
    width: 100%; height: 46px;
    border: 1.5px solid #e2e8f0; border-radius: 8px;
    background: #fff; display: flex; align-items: center;
    justify-content: center; gap: 10px;
    font-size: 14px; font-weight: 600; font-family: inherit;
    color: #1e293b; cursor: pointer;
    transition: border-color .2s, box-shadow .2s;
  }
  .si-btn-google:hover { border-color: #b0bcd4; box-shadow: 0 2px 8px rgba(0,0,0,.07); }

  .si-signin-link { text-align: center; margin-top: 20px; font-size: 13.5px; color: #6b7a99; }
  .si-signin-link a { color: #2563eb; font-weight: 600; text-decoration: none; }

  .si-success {
    text-align: center; padding: 32px 0;
  }
  .si-success-icon {
    width: 64px; height: 64px; border-radius: 50%;
    background: #dcfce7; display: flex; align-items: center;
    justify-content: center; margin: 0 auto 20px;
  }
  .si-success h3 { font-size: 20px; font-weight: 700; color: #0d1b3e; margin-bottom: 8px; }
  .si-success p  { font-size: 14px; color: #6b7a99; line-height: 1.6; }

  .si-global-err {
    background: #fef2f2; border: 1px solid #fecaca;
    border-radius: 8px; padding: 12px 14px;
    font-size: 13px; color: #dc2626;
    margin-bottom: 18px; display: flex; gap: 8px; align-items: flex-start;
  }
`;

/* ── SVG helpers ── */
const UserIcon = () => (
  <svg className="si-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const MailIcon = () => (
  <svg className="si-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/>
  </svg>
);
const LockIcon = () => (
  <svg className="si-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const EyeIcon = ({ off }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: off ? 0.45 : 1 }}>
    {off ? (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </>
    ) : (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </>
    )}
  </svg>
);
const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="2,6 5,9 10,3"/>
  </svg>
);
const GoogleG = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908C16.658 14.233 17.64 11.925 17.64 9.2z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

/* ── Password strength ── */
function getStrength(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e"];
  const labels = ["Too short", "Weak — add uppercase", "Fair — add numbers", "Strong ✓"];
  return { score: s, color: s > 0 ? colors[s - 1] : "#e2e8f0", label: s > 0 ? labels[s - 1] : "Use 8+ characters, numbers & symbols" };
}

/* ── Validation ── */
function validate(fields) {
  const errs = {};
  if (!fields.firstName.trim()) errs.firstName = "First name is required";
  if (!fields.lastName.trim())  errs.lastName  = "Last name is required";
  if (!fields.email.trim())     errs.email     = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) errs.email = "Enter a valid email";
  if (!fields.password)         errs.password  = "Password is required";
  else if (fields.password.length < 8) errs.password = "Password must be at least 8 characters";
  if (!fields.confirm)          errs.confirm   = "Please confirm your password";
  else if (fields.confirm !== fields.password) errs.confirm = "Passwords do not match";
  if (!fields.terms)            errs.terms     = "You must accept the terms";
  return errs;
}

/* ── Save user to localStorage ── */
function saveUserToLocalStorage(fields) {
  // Get existing users array or start fresh
  const existingUsers = JSON.parse(localStorage.getItem("si_users") || "[]");

  // Check if email already registered
  const alreadyExists = existingUsers.some(u => u.email === fields.email);
  if (alreadyExists) throw new Error("An account with this email already exists.");

  // Build user object — never store raw password in a real app, use a backend!
  const newUser = {
    id: crypto.randomUUID(),
    firstName: fields.firstName.trim(),
    lastName: fields.lastName.trim(),
    email: fields.email.trim().toLowerCase(),
    password: fields.password, // ⚠️ For demo only — hash on a real server
    createdAt: new Date().toISOString(),
  };

  existingUsers.push(newUser);
  localStorage.setItem("si_users", JSON.stringify(existingUsers));

  // Also save the currently logged-in user (without password)
  const { password, ...safeUser } = newUser;
  localStorage.setItem("si_current_user", JSON.stringify(safeUser));
}

/* ── Main Component ── */
function Signup() {
  const [fields, setFields] = useState({
    firstName: "", lastName: "", email: "",
    password: "", confirm: "", terms: false,
  });
  const [errors, setErrors]     = useState({});
  const [showPw, setShowPw]     = useState(false);
  const [showCfm, setShowCfm]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [globalErr, setGlobalErr] = useState("");
  const [success, setSuccess]   = useState(false);

  const strength = getStrength(fields.password);

  const set = (key) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFields((f) => ({ ...f, [key]: val }));
    setErrors((er) => { const n = { ...er }; delete n[key]; return n; });
    setGlobalErr("");
  };

  const handleSubmit = async () => {
    const errs = validate(fields);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setGlobalErr("");
    try {
      // Save to localStorage
      saveUserToLocalStorage(fields);
      await new Promise((res) => setTimeout(res, 800)); // small delay for UX
      setSuccess(true);
    } catch (err) {
      setGlobalErr(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    alert("Google sign-up — wire up your OAuth provider here.");
  };

  return (
    <>
      <style>{styles}</style>
      <div className="si-page">

        {/* ── LEFT ── */}
        <aside className="si-left">
          <div className="si-brand">
            <div className="si-brand-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div>
              <div className="si-brand-name">SmartInventory</div>
              <div className="si-brand-sub">Inventory Management System</div>
            </div>
          </div>

          <div className="si-left-body">
            <h1>Smart Inventory Management</h1>
            <p>Track, manage, and optimize your inventory in real-time. Streamline operations and grow your business with SmartInventory.</p>
            <ul className="si-features">
              {["Real-time stock tracking","Low stock alerts","Purchase order management","Comprehensive reports"].map((f) => (
                <li key={f} className="si-feature-item">
                  <span className="si-feat-dot"><CheckIcon /></span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="si-illustration">
            <div className="si-iso">
              <div className="si-platform" />
              <div className="si-box1" />
              <div className="si-box2" />
              <div className="si-screen">
                <div className="si-screen-line" />
                <div className="si-screen-line short" />
                <div className="si-bars">
                  {[18,28,22,32,14].map((h, i) => (
                    <div key={i} className="si-bar" style={{ height: h }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ── RIGHT ── */}
        <main className="si-right">
          <div className="si-card">
            {success ? (
              <div className="si-success">
                <div className="si-success-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <h3>Account created!</h3>
                <p>Welcome to SmartInventory.<br/>Your details have been saved. <a href="/login" style={{color:"#2563eb",fontWeight:600}}>Sign in now →</a></p>
              </div>
            ) : (
              <>
                <div className="si-card-header">
                  <h2>Create an account</h2>
                  <p>Sign up to start managing your inventory</p>
                </div>

                {globalErr && (
                  <div className="si-global-err">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,marginTop:1}}>
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {globalErr}
                  </div>
                )}

                {/* Name row */}
                <div className="si-row2">
                  <div className="si-field">
                    <label>First name</label>
                    <div className="si-input-wrap">
                      <UserIcon />
                      <input type="text" placeholder="John" value={fields.firstName}
                        onChange={set("firstName")} className={errors.firstName ? "si-error" : ""} />
                    </div>
                    {errors.firstName && <span className="si-err-msg">{errors.firstName}</span>}
                  </div>
                  <div className="si-field">
                    <label>Last name</label>
                    <div className="si-input-wrap">
                      <UserIcon />
                      <input type="text" placeholder="Doe" value={fields.lastName}
                        onChange={set("lastName")} className={errors.lastName ? "si-error" : ""} />
                    </div>
                    {errors.lastName && <span className="si-err-msg">{errors.lastName}</span>}
                  </div>
                </div>

                {/* Email */}
                <div className="si-field">
                  <label>Email address</label>
                  <div className="si-input-wrap">
                    <MailIcon />
                    <input type="email" placeholder="Enter your email" value={fields.email}
                      onChange={set("email")} className={errors.email ? "si-error" : ""} />
                  </div>
                  {errors.email && <span className="si-err-msg">{errors.email}</span>}
                </div>

                {/* Password */}
                <div className="si-field">
                  <label>Password</label>
                  <div className="si-input-wrap">
                    <LockIcon />
                    <input type={showPw ? "text" : "password"} placeholder="Create a password"
                      value={fields.password} onChange={set("password")}
                      className={errors.password ? "si-error" : ""} />
                    <button className="si-toggle-pw" type="button" onClick={() => setShowPw(v => !v)}>
                      <EyeIcon off={showPw} />
                    </button>
                  </div>
                  {fields.password && (
                    <>
                      <div className="si-pw-bars">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="si-pw-bar"
                            style={{ background: i <= strength.score ? strength.color : "#e2e8f0" }} />
                        ))}
                      </div>
                      <span className="si-pw-label">{strength.label}</span>
                    </>
                  )}
                  {errors.password && <span className="si-err-msg">{errors.password}</span>}
                </div>

                {/* Confirm password */}
                <div className="si-field">
                  <label>Confirm password</label>
                  <div className="si-input-wrap">
                    <LockIcon />
                    <input type={showCfm ? "text" : "password"} placeholder="Repeat your password"
                      value={fields.confirm} onChange={set("confirm")}
                      className={errors.confirm ? "si-error" : ""} />
                    <button className="si-toggle-pw" type="button" onClick={() => setShowCfm(v => !v)}>
                      <EyeIcon off={showCfm} />
                    </button>
                  </div>
                  {errors.confirm && <span className="si-err-msg">{errors.confirm}</span>}
                </div>

                {/* Terms */}
                <div className="si-terms">
                  <input type="checkbox" id="si-terms" checked={fields.terms} onChange={set("terms")} />
                  <label htmlFor="si-terms">
                    I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
                  </label>
                </div>
                {errors.terms && <span className="si-err-msg" style={{display:"block",marginTop:-12,marginBottom:14}}>{errors.terms}</span>}

                {/* Submit */}
                <button className="si-btn-primary" onClick={handleSubmit} disabled={loading}>
                  {loading ? <><span className="si-spinner" /> Creating account…</> : "Create Account"}
                </button>

                <div className="si-divider">or</div>

                <button className="si-btn-google" onClick={handleGoogle}>
                  <GoogleG /> Continue with Google
                </button>

                <p className="si-signin-link">
                  Already have an account? <a href="/login">Sign in</a>
                </p>
              </>
            )}
          </div>
        </main>

      </div>
    </>
  );
}

export default Signup;
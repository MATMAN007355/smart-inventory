import { useState, createContext, useContext } from "react";

// ─── Settings Context ─────────────────────────────────────────────────────────
export const SettingsContext = createContext(null);

export function useSettings() {
  return useContext(SettingsContext);
}

export function SettingsProvider({ children }) {
  const saved = (() => {
    try { return JSON.parse(localStorage.getItem("appSettings")) || {}; } catch { return {}; }
  })();

  const [warehouse,         setWarehouse]         = useState(saved.warehouse         ?? "Main Warehouse");
  const [lowStockThreshold, setLowStockThreshold] = useState(saved.lowStockThreshold ?? 10);
  const [dateFormat,        setDateFormat]        = useState(saved.dateFormat        ?? "MM/DD/YYYY");
  const [currency,          setCurrency]          = useState(saved.currency          ?? "USD - US Dollar ($)");
  const [timeZone,          setTimeZone]          = useState(saved.timeZone          ?? "UTC-05:00 Eastern Time");
  const [itemsPerPage,      setItemsPerPage]      = useState(saved.itemsPerPage      ?? "10");
  const [inventoryToggles,  setInventoryToggles]  = useState(saved.inventoryToggles  ?? {
    "Enable Low Stock Alerts":  true,
    "Auto-reorder Suggestions": true,
    "Enable Stock Tracking":    true,
    "Batch Tracking":           true,
    "Allow Negative Stock":     false,
    "Serial Number Tracking":   false,
  });
  const [autoBackup,      setAutoBackup]      = useState(saved.autoBackup      ?? true);
  const [backupRetention, setBackupRetention] = useState(saved.backupRetention ?? 30);

  const saveAll = () => {
    const settings = {
      warehouse, lowStockThreshold, dateFormat, currency,
      timeZone, itemsPerPage, inventoryToggles, autoBackup, backupRetention,
    };
    localStorage.setItem("appSettings", JSON.stringify(settings));
  };

  return (
    <SettingsContext.Provider value={{
      warehouse,         setWarehouse,
      lowStockThreshold, setLowStockThreshold,
      dateFormat,        setDateFormat,
      currency,          setCurrency,
      timeZone,          setTimeZone,
      itemsPerPage,      setItemsPerPage,
      inventoryToggles,  setInventoryToggles,
      autoBackup,        setAutoBackup,
      backupRetention,   setBackupRetention,
      saveAll,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

// ─── Shared styles ─────────────────────────────────────────────────────────────
// Defined at module level so all tab components in this file can use them

const cardClass  = "bg-slate-900 border border-slate-700 rounded-xl p-6";
const inputClass = "px-3 py-2 border border-slate-600 rounded-xl text-sm outline-none bg-slate-800 text-slate-200 placeholder-slate-500 focus:border-indigo-500 w-full";
const labelClass = "text-xs text-slate-500";
const selectClass = "px-3 py-2 border border-slate-600 rounded-xl text-sm outline-none bg-slate-800 text-slate-200 focus:border-indigo-500 w-full cursor-pointer";

// ─── Toggle Switch ─────────────────────────────────────────────────────────────

function Toggle({ on, onToggle }) {
  return (
    <div
      onClick={onToggle}
      className={`w-10 h-6 rounded-full flex items-center px-1 cursor-pointer transition-all shrink-0 ${
        on ? "bg-indigo-600 justify-end" : "bg-slate-600 justify-start"
      }`}
    >
      <div className="w-4 h-4 bg-white rounded-full shadow" />
    </div>
  );
}

// ─── Main Settings Component ───────────────────────────────────────────────────

function Settings() {
  const {
    warehouse,         setWarehouse,
    lowStockThreshold, setLowStockThreshold,
    dateFormat,        setDateFormat,
    currency,          setCurrency,
    timeZone,          setTimeZone,
    itemsPerPage,      setItemsPerPage,
    inventoryToggles,  setInventoryToggles,
    autoBackup,        setAutoBackup,
    backupRetention,   setBackupRetention,
    saveAll,
  } = useSettings();

  const [activeTab, setActiveTab] = useState(0);
  const [saved,     setSaved]     = useState(false);

  const handleSave = () => {
    saveAll();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleToggle = (label) => {
    setInventoryToggles((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const tabs = [
    { label: "General",             icon: "⚙️" },
    { label: "Company Information", icon: "🏢" },
    { label: "Notifications",       icon: "🔔" },
    { label: "Warehouses",          icon: "🏭" },
    { label: "Security",            icon: "🔒" },
    { label: "Data Management",     icon: "🗄️" },
  ];

  return (
    <main className="flex-1 bg-slate-800 p-8">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Settings</h1>
          <p className="text-sm text-slate-400 mt-1">Manage your account, preferences, and system configuration</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-500 mt-1"
        >
          {saved ? "✅ Saved!" : "💾 Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Sidebar */}
        <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl h-fit">
          <ul className="space-y-1 text-sm text-slate-400">
            {tabs.map((tab, i) => (
              <li
                key={tab.label}
                onClick={() => setActiveTab(i)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors ${
                  activeTab === i
                    ? "bg-slate-700 text-slate-100 font-medium"
                    : "hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">

          {activeTab === 0 && (
            <>
              {/* System Preferences */}
              <div className={cardClass}>
                <h2 className="text-sm font-semibold text-slate-200 mb-1">System Preferences</h2>
                <p className="text-xs text-slate-500 mb-5">Configure basic system settings and preferences</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className={labelClass}>Default Warehouse</label>
                    <select value={warehouse} onChange={(e) => setWarehouse(e.target.value)} className={selectClass}>
                      <option>Main Warehouse</option>
                      <option>Warehouse B</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className={labelClass}>Default Low Stock Threshold</label>
                    <input
                      type="number"
                      value={lowStockThreshold}
                      onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                      className={inputClass}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className={labelClass}>Date Format</label>
                    <select value={dateFormat} onChange={(e) => setDateFormat(e.target.value)} className={selectClass}>
                      <option>MM/DD/YYYY</option>
                      <option>DD/MM/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className={labelClass}>Currency</label>
                    <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={selectClass}>
                      <option>USD - US Dollar ($)</option>
                      <option>EUR - Euro (€)</option>
                      <option>GBP - British Pound (£)</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className={labelClass}>Time Zone</label>
                    <select value={timeZone} onChange={(e) => setTimeZone(e.target.value)} className={selectClass}>
                      <option>UTC-05:00 Eastern Time</option>
                      <option>UTC+00:00 UTC</option>
                      <option>UTC+01:00 West Africa Time</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className={labelClass}>Items Per Page</label>
                    <select value={itemsPerPage} onChange={(e) => setItemsPerPage(e.target.value)} className={selectClass}>
                      <option>10</option>
                      <option>25</option>
                      <option>50</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Inventory Settings */}
              <div className={cardClass}>
                <h2 className="text-sm font-semibold text-slate-200 mb-1">Inventory Settings</h2>
                <p className="text-xs text-slate-500 mb-5">Configure inventory management preferences</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Enable Low Stock Alerts",  desc: "Get notified when items are running low" },
                    { label: "Auto-reorder Suggestions", desc: "Get suggestions for reordering items"    },
                    { label: "Enable Stock Tracking",    desc: "Track stock levels for all products"     },
                    { label: "Batch Tracking",           desc: "Track product batches and expiration"    },
                    { label: "Allow Negative Stock",     desc: "Allow stock levels to go below zero"     },
                    { label: "Serial Number Tracking",   desc: "Track individual serial numbers"         },
                  ].map((toggle) => (
                    <div key={toggle.label} className="flex items-center justify-between p-3 border border-slate-700 rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-slate-300">{toggle.label}</p>
                        <p className="text-xs text-slate-500">{toggle.desc}</p>
                      </div>
                      <Toggle on={inventoryToggles[toggle.label]} onToggle={() => handleToggle(toggle.label)} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Backup & Data */}
              <div className={cardClass}>
                <h2 className="text-sm font-semibold text-slate-200 mb-1">Backup & Data</h2>
                <p className="text-xs text-slate-500 mb-5">Manage backups and data settings</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 border border-slate-700 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-slate-300">Auto Backup</p>
                      <p className="text-xs text-slate-500">Automatically backup data daily</p>
                    </div>
                    <Toggle on={autoBackup} onToggle={() => setAutoBackup((v) => !v)} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className={labelClass}>Backup Retention (Days)</label>
                    <input
                      type="number"
                      value={backupRetention}
                      onChange={(e) => setBackupRetention(Number(e.target.value))}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 1 && <CompanyInformationTab />}
          {activeTab === 2 && <NotificationsTab />}
          {activeTab === 3 && <WarehousesTab />}
          {activeTab === 4 && <SecurityTab />}
          {activeTab === 5 && <DataManagementTab />}

        </div>
      </div>
    </main>
  );
}

// ─── Company Information Tab ───────────────────────────────────────────────────

function CompanyInformationTab() {
  const [form, setForm] = useState({
    companyName: "MyApp Inc.",
    email:       "admin@myapp.com",
    phone:       "+1 (555) 000-0000",
    address:     "123 Main St",
    city:        "New York",
    country:     "United States",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className={cardClass}>
      <h2 className="text-sm font-semibold text-slate-200 mb-1">Company Information</h2>
      <p className="text-xs text-slate-500 mb-5">Update your company details and contact information</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: "Company Name",  key: "companyName" },
          { label: "Email Address", key: "email"       },
          { label: "Phone Number",  key: "phone"       },
          { label: "Address",       key: "address"     },
          { label: "City",          key: "city"        },
          { label: "Country",       key: "country"     },
        ].map(({ label, key }) => (
          <div key={key} className="flex flex-col gap-1">
            <label className={labelClass}>{label}</label>
            <input
              value={form[key]}
              onChange={(e) => set(key, e.target.value)}
              className={inputClass}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Notifications Tab ─────────────────────────────────────────────────────────

function NotificationsTab() {
  const [notifs, setNotifs] = useState({
    "Email Notifications":   true,
    "Low Stock Alerts":      true,
    "Order Updates":         true,
    "System Alerts":         false,
    "Weekly Summary Report": true,
    "Push Notifications":    false,
  });
  const toggle = (k) => setNotifs((n) => ({ ...n, [k]: !n[k] }));

  const items = [
    { label: "Email Notifications",   desc: "Receive notifications via email"       },
    { label: "Low Stock Alerts",      desc: "Alert when items fall below threshold" },
    { label: "Order Updates",         desc: "Updates on purchase and sales orders"  },
    { label: "System Alerts",         desc: "Critical system health notifications"  },
    { label: "Weekly Summary Report", desc: "Weekly inventory digest every Monday"  },
    { label: "Push Notifications",    desc: "Browser push notifications"            },
  ];

  return (
    <div className={cardClass}>
      <h2 className="text-sm font-semibold text-slate-200 mb-1">Notifications</h2>
      <p className="text-xs text-slate-500 mb-5">Manage how and when you receive notifications</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between p-3 border border-slate-700 rounded-xl">
            <div>
              <p className="text-sm font-medium text-slate-300">{item.label}</p>
              <p className="text-xs text-slate-500">{item.desc}</p>
            </div>
            <Toggle on={notifs[item.label]} onToggle={() => toggle(item.label)} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Warehouses Tab ────────────────────────────────────────────────────────────

function WarehousesTab() {
  const [warehouses, setWarehouses] = useState([
    { id: 1, name: "Main Warehouse", location: "New York, USA",    capacity: 5000, active: true  },
    { id: 2, name: "Warehouse B",    location: "Los Angeles, USA", capacity: 3000, active: true  },
    { id: 3, name: "Warehouse C",    location: "Lagos, Nigeria",   capacity: 2000, active: false },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [newWH,   setNewWH]   = useState({ name: "", location: "", capacity: "" });

  const toggleActive = (id) =>
    setWarehouses((ws) => ws.map((w) => w.id === id ? { ...w, active: !w.active } : w));

  const addWarehouse = () => {
    if (!newWH.name.trim()) return;
    setWarehouses((ws) => [
      ...ws,
      { id: Date.now(), ...newWH, capacity: Number(newWH.capacity) || 0, active: true },
    ]);
    setNewWH({ name: "", location: "", capacity: "" });
    setShowAdd(false);
  };

  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold text-slate-200">Warehouses</h2>
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500"
        >
          + Add Warehouse
        </button>
      </div>
      <p className="text-xs text-slate-500 mb-5">Manage your warehouse locations</p>

      {showAdd && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5 p-4 border border-slate-600 rounded-xl bg-slate-800">
          {[["Warehouse Name", "name"], ["Location", "location"], ["Capacity", "capacity"]].map(([lbl, key]) => (
            <div key={key} className="flex flex-col gap-1">
              <label className={labelClass}>{lbl}</label>
              <input
                value={newWH[key]}
                onChange={(e) => setNewWH((w) => ({ ...w, [key]: e.target.value }))}
                className={inputClass}
              />
            </div>
          ))}
          <div className="md:col-span-3 flex gap-2 mt-1">
            <button onClick={addWarehouse} className="px-4 py-2 bg-indigo-600 text-white text-xs rounded-xl hover:bg-indigo-500">
              Add
            </button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 border border-slate-600 text-slate-300 text-xs rounded-xl hover:bg-slate-700">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {warehouses.map((w) => (
          <div key={w.id} className="flex items-center justify-between p-4 border border-slate-700 rounded-xl">
            <div>
              <p className="text-sm font-medium text-slate-200">{w.name}</p>
              <p className="text-xs text-slate-500">{w.location} · Capacity: {w.capacity.toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2 py-1 rounded-full ${
                w.active
                  ? "bg-emerald-900 text-emerald-400"
                  : "bg-slate-700 text-slate-400"
              }`}>
                {w.active ? "Active" : "Inactive"}
              </span>
              <Toggle on={w.active} onToggle={() => toggleActive(w.id)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Security Tab ──────────────────────────────────────────────────────────────

function SecurityTab() {
  const [mode,            setMode]            = useState("password");
  const [passwords,       setPasswords]       = useState({ current: "", newPass: "", confirm: "" });
  const [emailField,      setEmailField]      = useState("");
  const [newPassViaEmail, setNewPassViaEmail] = useState("");
  const [confirmViaEmail, setConfirmViaEmail] = useState("");
  const [twoFA,           setTwoFA]           = useState(false);
  const [sessionTimeout,  setSessionTimeout]  = useState("30");
  const [msg,             setMsg]             = useState("");

  const set = (k, v) => setPasswords((p) => ({ ...p, [k]: v }));

  const updatePasswordInStorage = (email, newPassword) => {
    const users = JSON.parse(localStorage.getItem("si_users") || "[]");
    const idx   = users.findIndex((u) => u.email === email.toLowerCase());
    if (idx === -1) return false;
    users[idx].password = newPassword;
    localStorage.setItem("si_users", JSON.stringify(users));
    return true;
  };

  const handleChangePassword = () => {
    const currentUser = JSON.parse(localStorage.getItem("si_current_user") || "null");
    if (!currentUser)                              return setMsg("❌ No logged-in user found. Please log in again.");
    const users    = JSON.parse(localStorage.getItem("si_users") || "[]");
    const fullUser = users.find((u) => u.email === currentUser.email);
    if (!fullUser)                                 return setMsg("❌ User account not found.");
    if (!passwords.current)                        return setMsg("❌ Please enter your current password.");
    if (passwords.current !== fullUser.password)   return setMsg("❌ Current password is incorrect.");
    if (passwords.newPass.length < 8)              return setMsg("❌ New password must be at least 8 characters.");
    if (passwords.newPass !== passwords.confirm)   return setMsg("❌ New passwords do not match.");
    updatePasswordInStorage(currentUser.email, passwords.newPass);
    setMsg("✅ Password changed successfully.");
    setPasswords({ current: "", newPass: "", confirm: "" });
    setTimeout(() => setMsg(""), 3000);
  };

  const handleChangeViaEmail = () => {
    if (!emailField.trim())                                    return setMsg("❌ Please enter your email address.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField))       return setMsg("❌ Enter a valid email address.");
    if (newPassViaEmail.length < 8)                            return setMsg("❌ New password must be at least 8 characters.");
    if (newPassViaEmail !== confirmViaEmail)                   return setMsg("❌ Passwords do not match.");
    const updated = updatePasswordInStorage(emailField.trim(), newPassViaEmail);
    if (!updated)                                              return setMsg("❌ No account found with that email address.");
    setMsg("✅ Password updated successfully via email.");
    setEmailField(""); setNewPassViaEmail(""); setConfirmViaEmail("");
    setTimeout(() => setMsg(""), 3000);
  };

  const modeBtnClass = (m) =>
    `px-4 py-1.5 text-xs rounded-xl border transition-colors ${
      mode === m
        ? "bg-indigo-600 text-white border-indigo-600"
        : "bg-slate-800 text-slate-400 border-slate-600 hover:bg-slate-700"
    }`;

  return (
    <div className="space-y-6">

      {/* Change Password */}
      <div className={cardClass}>
        <h2 className="text-sm font-semibold text-slate-200 mb-1">Change Password</h2>
        <p className="text-xs text-slate-500 mb-4">Update your account password</p>

        <div className="flex gap-2 mb-5">
          <button onClick={() => { setMode("password"); setMsg(""); }} className={modeBtnClass("password")}>
            Use Current Password
          </button>
          <button onClick={() => { setMode("email"); setMsg(""); }} className={modeBtnClass("email")}>
            Forgot Password? Use Email
          </button>
        </div>

        {mode === "password" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[["Current Password", "current"], ["New Password", "newPass"], ["Confirm Password", "confirm"]].map(([lbl, key]) => (
                <div key={key} className="flex flex-col gap-1">
                  <label className={labelClass}>{lbl}</label>
                  <input
                    type="password"
                    value={passwords[key]}
                    onChange={(e) => set(key, e.target.value)}
                    className={inputClass}
                  />
                </div>
              ))}
            </div>
            {msg && (
              <p className={`text-xs mt-3 ${msg.startsWith("✅") ? "text-emerald-400" : "text-red-400"}`}>{msg}</p>
            )}
            <button onClick={handleChangePassword} className="mt-4 px-4 py-2 bg-indigo-600 text-white text-sm rounded-xl hover:bg-indigo-500">
              Update Password
            </button>
          </>
        )}

        {mode === "email" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className={labelClass}>Your Email Address</label>
                <input
                  type="email"
                  placeholder="Enter your registered email"
                  value={emailField}
                  onChange={(e) => { setEmailField(e.target.value); setMsg(""); }}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelClass}>New Password</label>
                <input
                  type="password"
                  placeholder="Min. 8 characters"
                  value={newPassViaEmail}
                  onChange={(e) => { setNewPassViaEmail(e.target.value); setMsg(""); }}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelClass}>Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmViaEmail}
                  onChange={(e) => { setConfirmViaEmail(e.target.value); setMsg(""); }}
                  className={inputClass}
                />
              </div>
            </div>
            {msg && (
              <p className={`text-xs mt-3 ${msg.startsWith("✅") ? "text-emerald-400" : "text-red-400"}`}>{msg}</p>
            )}
            <button onClick={handleChangeViaEmail} className="mt-4 px-4 py-2 bg-indigo-600 text-white text-sm rounded-xl hover:bg-indigo-500">
              Reset Password via Email
            </button>
          </>
        )}
      </div>

      {/* Security Options */}
      <div className={cardClass}>
        <h2 className="text-sm font-semibold text-slate-200 mb-5">Security Options</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 border border-slate-700 rounded-xl">
            <div>
              <p className="text-sm font-medium text-slate-300">Two-Factor Authentication</p>
              <p className="text-xs text-slate-500">Add an extra layer of security to your account</p>
            </div>
            <Toggle on={twoFA} onToggle={() => setTwoFA((v) => !v)} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Session Timeout (minutes)</label>
            <select
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
              className={`${selectClass} w-48`}
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">60 minutes</option>
              <option value="120">2 hours</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Data Management Tab ───────────────────────────────────────────────────────

function DataManagementTab() {
  const [exporting,    setExporting]    = useState(false);
  const [importing,    setImporting]    = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing,     setClearing]     = useState(false);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      const data = localStorage.getItem("appSettings") || "{}";
      const blob = new Blob([data], { type: "application/json" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = "myapp-settings-export.json"; a.click();
      URL.revokeObjectURL(url);
      setExporting(false);
    }, 1200);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        localStorage.setItem("appSettings", JSON.stringify(parsed));
      } catch { /* invalid file */ }
      setTimeout(() => setImporting(false), 800);
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    if (!confirmClear) return setConfirmClear(true);
    setClearing(true);
    setTimeout(() => {
      localStorage.removeItem("appSettings");
      setClearing(false);
      setConfirmClear(false);
    }, 1200);
  };

  return (
    <div className={cardClass}>
      <h2 className="text-sm font-semibold text-slate-200 mb-1">Data Management</h2>
      <p className="text-xs text-slate-500 mb-5">Import, export, or clear your application data</p>
      <div className="space-y-4">

        <div className="flex items-center justify-between p-4 border border-slate-700 rounded-xl">
          <div>
            <p className="text-sm font-medium text-slate-300">Export Data</p>
            <p className="text-xs text-slate-500">Download your saved settings as a JSON file</p>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-4 py-2 bg-indigo-600 text-white text-xs rounded-xl hover:bg-indigo-500 disabled:opacity-50"
          >
            {exporting ? "Exporting…" : "⬇️ Export"}
          </button>
        </div>

        <div className="flex items-center justify-between p-4 border border-slate-700 rounded-xl">
          <div>
            <p className="text-sm font-medium text-slate-300">Import Data</p>
            <p className="text-xs text-slate-500">Upload a previously exported JSON settings file</p>
          </div>
          <label className={`px-4 py-2 bg-indigo-600 text-white text-xs rounded-xl hover:bg-indigo-500 cursor-pointer ${importing ? "opacity-50 pointer-events-none" : ""}`}>
            {importing ? "Importing…" : "⬆️ Import"}
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
        </div>

        {/* Danger zone — no 950 shades, uses safe red-900 */}
        <div className="flex items-center justify-between p-4 border border-red-800 rounded-xl bg-red-900/20">
          <div>
            <p className="text-sm font-medium text-red-400">Clear All Data</p>
            <p className="text-xs text-red-400 opacity-60">Permanently delete all saved settings — cannot be undone</p>
          </div>
          <button
            onClick={handleClear}
            disabled={clearing}
            className={`px-4 py-2 text-white text-xs rounded-xl disabled:opacity-50 transition-colors ${
              confirmClear ? "bg-red-600 hover:bg-red-700" : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {clearing ? "Clearing…" : confirmClear ? "⚠️ Confirm Clear" : "🗑️ Clear Data"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default Settings;
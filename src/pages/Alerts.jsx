import { useState } from "react";
import { useSettings } from "./settings";

const ALL_ALERTS = [
  {
    id: 1,
    title: "15 items out of stock",
    description: "These items are out of stock. Restock now to avoid disruptions.",
    type: "Out of Stock",
    typeBadge: "bg-red-950 text-red-400",
    product: "Wireless Earbuds (WE-1001)",
    productSub: "+ 14 more",
    warehouse: "Main Warehouse",
    date: "May 18, 2024",
    time: "10:15 AM",
    status: "New",
    severity: "Critical",
  },
  {
    id: 2,
    title: "23 items low in stock",
    description: "These items are running low. Consider reordering.",
    type: "Low Stock",
    typeBadge: "bg-yellow-950 text-yellow-400",
    product: "Premium Coffee Beans (CF-2002)",
    productSub: "+ 22 more",
    warehouse: "Main Warehouse",
    date: "May 18, 2024",
    time: "9:30 AM",
    status: "New",
    severity: "Warning",
  },
  {
    id: 3,
    title: "PO #1052 is delayed",
    description: "Expected delivery date is May 20, 2024",
    type: "Purchase Order",
    typeBadge: "bg-blue-950 text-blue-400",
    product: "PO #1052",
    productSub: "Supplier: Fresh Supplies Co.",
    warehouse: "Main Warehouse",
    date: "May 18, 2024",
    time: "8:45 AM",
    status: "New",
    severity: "Warning",
  },
  {
    id: 4,
    title: "Stock in completed",
    description: "PO #1051 has been received successfully.",
    type: "Stock In",
    typeBadge: "bg-emerald-950 text-emerald-400",
    product: "PO #1051",
    productSub: "123 items received",
    warehouse: "Main Warehouse",
    date: "May 18, 2024",
    time: "7:20 AM",
    status: "Resolved",
    severity: "Info",
  },
  {
    id: 5,
    title: "Reorder level reached",
    description: "Ergonomic Chair (CH-3003) has reached reorder level.",
    type: "Reorder Level",
    typeBadge: "bg-orange-950 text-orange-400",
    product: "Ergonomic Chair (CH-3003)",
    productSub: "",
    warehouse: "Main Warehouse",
    date: "May 17, 2024",
    time: "6:10 PM",
    status: "New",
    severity: "Critical",
  },
  {
    id: 6,
    title: "Temperature sensor alert",
    description: "Cold storage unit B exceeded safe temperature threshold.",
    type: "Out of Stock",
    typeBadge: "bg-red-950 text-red-400",
    product: "Cold Storage Unit B",
    productSub: "",
    warehouse: "Warehouse B",
    date: "May 17, 2024",
    time: "5:00 PM",
    status: "New",
    severity: "Critical",
  },
  {
    id: 7,
    title: "5 items expiring soon",
    description: "These items will expire within 7 days.",
    type: "Low Stock",
    typeBadge: "bg-yellow-950 text-yellow-400",
    product: "Organic Milk (OM-4401)",
    productSub: "+ 4 more",
    warehouse: "Warehouse B",
    date: "May 17, 2024",
    time: "3:45 PM",
    status: "New",
    severity: "Warning",
  },
  {
    id: 8,
    title: "New supplier registered",
    description: "Green Valley Farms has been added as a supplier.",
    type: "Purchase Order",
    typeBadge: "bg-blue-950 text-blue-400",
    product: "Green Valley Farms",
    productSub: "Supplier onboarded",
    warehouse: "Main Warehouse",
    date: "May 17, 2024",
    time: "2:30 PM",
    status: "Resolved",
    severity: "Info",
  },
  {
    id: 9,
    title: "Stock transfer completed",
    description: "50 units moved from Main Warehouse to Warehouse B.",
    type: "Stock In",
    typeBadge: "bg-emerald-950 text-emerald-400",
    product: "Office Chairs (OC-2200)",
    productSub: "50 units transferred",
    warehouse: "Warehouse B",
    date: "May 16, 2024",
    time: "11:00 AM",
    status: "Resolved",
    severity: "Info",
  },
  {
    id: 10,
    title: "Reorder level reached",
    description: "Standing Desk (SD-5500) has reached reorder level.",
    type: "Reorder Level",
    typeBadge: "bg-orange-950 text-orange-400",
    product: "Standing Desk (SD-5500)",
    productSub: "",
    warehouse: "Main Warehouse",
    date: "May 16, 2024",
    time: "9:15 AM",
    status: "New",
    severity: "Warning",
  },
];

const ITEMS_PER_PAGE = 5;

const DEFAULT_NOTIF_SETTINGS = {
  email: true,
  sms: false,
  push: true,
  critical: true,
  warning: true,
  info: false,
};

function loadNotifSettings() {
  try {
    const saved = localStorage.getItem("notificationSettings");
    return saved ? { ...DEFAULT_NOTIF_SETTINGS, ...JSON.parse(saved) } : DEFAULT_NOTIF_SETTINGS;
  } catch {
    return DEFAULT_NOTIF_SETTINGS;
  }
}

const cardClass = "bg-slate-900 border border-slate-700 rounded-xl p-6";
const selectClass = "text-xs border border-slate-600 rounded-lg px-2 py-1 outline-none bg-slate-800 text-slate-300";

function Toggle({ on, onToggle }) {
  return (
    <div
      onClick={onToggle}
      className={`relative inline-flex items-center w-11 h-6 rounded-full cursor-pointer transition-colors duration-200 ${on ? "bg-indigo-600" : "bg-slate-600"}`}
    >
      <span
        className={`inline-block w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 ${on ? "translate-x-6" : "translate-x-1"}`}
      />
    </div>
  );
}

function NotificationSettingsModal({ onClose, onSettingsSaved }) {
  const [settings, setSettings] = useState(loadNotifSettings);
  const [saved, setSaved] = useState(false);
  const { inventoryToggles } = useSettings();
  const lowStockEnabled = inventoryToggles["Enable Low Stock Alerts"] ?? true;

  const toggle = (key) => setSettings((s) => ({ ...s, [key]: !s[key] }));

  const handleSave = () => {
    localStorage.setItem("notificationSettings", JSON.stringify(settings));
    onSettingsSaved(settings);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-slate-100">Notification Settings</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-xl leading-none">✕</button>
        </div>

        {!lowStockEnabled && (
          <div className="mb-4 px-3 py-2 bg-yellow-950 border border-yellow-800 rounded-xl text-xs text-yellow-400">
            ⚠️ "Enable Low Stock Alerts" is off in Settings — Warning alerts may be suppressed globally.
          </div>
        )}

        <p className="text-xs text-slate-500 uppercase font-semibold mb-3 tracking-wide">Channels</p>
        {[
          { key: "email", label: "Email Notifications" },
          { key: "sms",   label: "SMS Notifications"   },
          { key: "push",  label: "Push Notifications"  },
        ].map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between py-3 border-b border-slate-700">
            <span className="text-sm text-slate-300">{label}</span>
            <Toggle on={settings[key]} onToggle={() => toggle(key)} />
          </div>
        ))}

        <p className="text-xs text-slate-500 uppercase font-semibold mb-3 mt-5 tracking-wide">Alert Types</p>
        {[
          { key: "critical", label: "Critical Alerts", desc: "Hides Critical alerts from the table when off" },
          { key: "warning",  label: "Warning Alerts",  desc: "Hides Warning alerts from the table when off" },
          { key: "info",     label: "Info Alerts",     desc: "Hides Info alerts from the table when off"    },
        ].map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between py-3 border-b border-slate-700">
            <div>
              <p className="text-sm text-slate-300">{label}</p>
              <p className="text-xs text-slate-500">{desc}</p>
            </div>
            <Toggle on={settings[key]} onToggle={() => toggle(key)} />
          </div>
        ))}

        <button
          onClick={handleSave}
          className="mt-6 w-full py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-500"
        >
          {saved ? "✅ Saved!" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}

function ViewAlertModal({ alert, onClose, onMarkResolved }) {
  return (
    <div className="fixed inset-0 bg-slate-950/70 flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-slate-100">Alert Details</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-xl leading-none">✕</button>
        </div>

        <div className="space-y-3 text-sm text-slate-400">
          <div className="flex justify-between">
            <span className="text-slate-500">Title</span>
            <span className="font-medium text-slate-200">{alert.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Description</span>
            <span className="max-w-xs text-right text-slate-300">{alert.description}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Type</span>
            <span className={`text-xs px-2 py-1 rounded-full ${alert.typeBadge}`}>{alert.type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Product</span>
            <span className="text-slate-300">{alert.product}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Warehouse</span>
            <span className="text-slate-300">{alert.warehouse}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Date & Time</span>
            <span className="text-slate-300">{alert.date} – {alert.time}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Status</span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              alert.status === "Resolved"
                ? "bg-emerald-950 text-emerald-400"
                : "bg-red-950 text-red-400"
            }`}>
              {alert.status}
            </span>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          {alert.status !== "Resolved" && (
            <button
              onClick={() => { onMarkResolved(alert.id); onClose(); }}
              className="flex-1 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-500"
            >
              Mark as Resolved
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-slate-600 text-sm text-slate-300 rounded-xl hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function Alerts() {
  const { inventoryToggles } = useSettings();
  const lowStockAlertsEnabled = inventoryToggles["Enable Low Stock Alerts"] ?? true;

  const [alerts, setAlerts]                       = useState(ALL_ALERTS);
  const [activeTab, setActiveTab]                 = useState("All Alerts");
  const [typeFilter, setTypeFilter]               = useState("All Types");
  const [warehouseFilter, setWarehouseFilter]     = useState("All Warehouses");
  const [statusFilter, setStatusFilter]           = useState("All Status");
  const [currentPage, setCurrentPage]             = useState(1);
  const [viewAlert, setViewAlert]                 = useState(null);
  const [showNotifSettings, setShowNotifSettings] = useState(false);
  const [notifSettings, setNotifSettings]         = useState(loadNotifSettings);

  const criticalCount = alerts.filter((a) => a.severity === "Critical" && a.status !== "Resolved" && notifSettings.critical).length;
  const warningCount  = alerts.filter((a) => a.severity === "Warning"  && a.status !== "Resolved" && notifSettings.warning && lowStockAlertsEnabled).length;
  const infoCount     = alerts.filter((a) => a.severity === "Info"     && a.status !== "Resolved" && notifSettings.info).length;
  const resolvedCount = alerts.filter((a) => a.status === "Resolved").length;

  const filtered = alerts.filter((a) => {
    if (!lowStockAlertsEnabled && a.type === "Low Stock") return false;
    const severityAllowed =
      (a.severity === "Critical" && notifSettings.critical) ||
      (a.severity === "Warning"  && notifSettings.warning)  ||
      (a.severity === "Info"     && notifSettings.info);
    const tabMatch =
      activeTab === "All Alerts" ||
      (activeTab === "Critical" && a.severity === "Critical") ||
      (activeTab === "Warning"  && a.severity === "Warning")  ||
      (activeTab === "Info"     && a.severity === "Info")     ||
      (activeTab === "Resolved" && a.status   === "Resolved");
    const typeMatch      = typeFilter      === "All Types"      || a.type      === typeFilter;
    const warehouseMatch = warehouseFilter === "All Warehouses" || a.warehouse === warehouseFilter;
    const statusMatch    = statusFilter    === "All Status"     || a.status    === statusFilter;
    return severityAllowed && tabMatch && typeMatch && warehouseMatch && statusMatch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage   = Math.min(currentPage, totalPages);
  const paginated  = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const goToPage = (p) => setCurrentPage(Math.max(1, Math.min(p, totalPages)));

  const handleTabChange       = (tab) => { setActiveTab(tab);     setCurrentPage(1); };
  const handleTypeFilter      = (v)   => { setTypeFilter(v);      setCurrentPage(1); };
  const handleWarehouseFilter = (v)   => { setWarehouseFilter(v); setCurrentPage(1); };
  const handleStatusFilter    = (v)   => { setStatusFilter(v);    setCurrentPage(1); };

  const isFiltered =
    activeTab !== "All Alerts" ||
    typeFilter !== "All Types" ||
    warehouseFilter !== "All Warehouses" ||
    statusFilter !== "All Status";

  const clearFilters = () => {
    setActiveTab("All Alerts");
    setTypeFilter("All Types");
    setWarehouseFilter("All Warehouses");
    setStatusFilter("All Status");
    setCurrentPage(1);
  };

  const markAllAsRead = () =>
    setAlerts((prev) => prev.map((a) => ({ ...a, status: "Resolved" })));

  const markResolved = (id) =>
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, status: "Resolved" } : a));

  const exportCSV = () => {
    const header = ["ID", "Title", "Type", "Product", "Warehouse", "Date", "Time", "Status", "Severity"];
    const rows = filtered.map((a) => [
      a.id, `"${a.title}"`, a.type, `"${a.product}"`, a.warehouse, a.date, a.time, a.status, a.severity,
    ]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = "alerts.csv"; link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="flex-1 bg-slate-800 p-8">

      {showNotifSettings && (
        <NotificationSettingsModal
          onClose={() => setShowNotifSettings(false)}
          onSettingsSaved={(s) => { setNotifSettings(s); setCurrentPage(1); }}
        />
      )}
      {viewAlert && (
        <ViewAlertModal
          alert={viewAlert}
          onClose={() => setViewAlert(null)}
          onMarkResolved={markResolved}
        />
      )}

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Alerts</h1>
          <p className="text-sm text-slate-400 mt-1">View and manage all inventory alerts</p>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 border border-slate-600 rounded-xl bg-slate-900 text-sm font-medium text-slate-300 hover:bg-slate-700"
          >
            ✓ Mark all as read
          </button>
          <button
            onClick={() => setShowNotifSettings(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-500"
          >
            ⚙️ Notification Settings
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className={`bg-slate-900 border border-slate-700 p-5 rounded-xl transition-opacity ${!notifSettings.critical ? "opacity-40" : ""}`}>
          <p className="text-red-400 font-semibold text-sm mb-2">Critical Alerts</p>
          <p className="text-3xl font-bold text-slate-100">{criticalCount}</p>
          <p className="text-xs text-slate-500 mt-1">{notifSettings.critical ? "Require immediate action" : "Disabled in settings"}</p>
        </div>
        <div className={`bg-slate-900 border border-slate-700 p-5 rounded-xl transition-opacity ${!notifSettings.warning || !lowStockAlertsEnabled ? "opacity-40" : ""}`}>
          <p className="text-yellow-400 font-semibold text-sm mb-2">Warning Alerts</p>
          <p className="text-3xl font-bold text-slate-100">{warningCount}</p>
          <p className="text-xs text-slate-500 mt-1">{notifSettings.warning && lowStockAlertsEnabled ? "Check and review soon" : "Disabled in settings"}</p>
        </div>
        <div className={`bg-slate-900 border border-slate-700 p-5 rounded-xl transition-opacity ${!notifSettings.info ? "opacity-40" : ""}`}>
          <p className="text-blue-400 font-semibold text-sm mb-2">Info Alerts</p>
          <p className="text-3xl font-bold text-slate-100">{infoCount}</p>
          <p className="text-xs text-slate-500 mt-1">{notifSettings.info ? "For your information" : "Disabled in settings"}</p>
        </div>
        <div className="bg-slate-900 border border-slate-700 p-5 rounded-xl">
          <p className="text-emerald-400 font-semibold text-sm mb-2">Resolved Today</p>
          <p className="text-3xl font-bold text-slate-100">{resolvedCount}</p>
          <p className="text-xs text-slate-500 mt-1">Alerts resolved</p>
        </div>
      </div>

      {(!notifSettings.critical || !notifSettings.warning || !notifSettings.info || !lowStockAlertsEnabled) && (
        <div className="mb-4 px-4 py-3 bg-yellow-950 border border-yellow-800 rounded-xl text-xs text-yellow-400 flex items-center gap-2">
          ⚠️ Some alert types are hidden based on your Notification Settings.
          <button onClick={() => setShowNotifSettings(true)} className="underline font-medium">Manage settings</button>
        </div>
      )}

      <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
        <div className="flex items-center gap-6 text-sm font-medium text-slate-500 border-b border-slate-700">
          {["All Alerts", "Critical", "Warning", "Info", "Resolved"].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`pb-3 transition-colors ${
                activeTab === tab
                  ? "text-slate-100 border-b-2 border-indigo-500"
                  : "hover:text-slate-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select value={typeFilter} onChange={(e) => handleTypeFilter(e.target.value)} className={selectClass}>
            <option>All Types</option>
            <option>Out of Stock</option>
            <option>Low Stock</option>
            <option>Purchase Order</option>
            <option>Stock In</option>
            <option>Reorder Level</option>
          </select>
          <select value={warehouseFilter} onChange={(e) => handleWarehouseFilter(e.target.value)} className={selectClass}>
            <option>All Warehouses</option>
            <option>Main Warehouse</option>
            <option>Warehouse B</option>
          </select>
          <select value={statusFilter} onChange={(e) => handleStatusFilter(e.target.value)} className={selectClass}>
            <option>All Status</option>
            <option>New</option>
            <option>Resolved</option>
          </select>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 border border-slate-600 rounded-xl bg-slate-900 text-xs text-slate-300 hover:bg-slate-700"
          >
            ⬇️ Export
          </button>
          {isFiltered && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2 border border-red-900 rounded-xl bg-red-950 text-xs text-red-400 hover:bg-red-900"
            >
              ✕ Clear Filters
            </button>
          )}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-x-auto">
        <table className="w-full text-sm text-slate-400">
          <thead className="text-xs text-slate-500 border-b border-slate-700">
            <tr>
              <th className="px-6 py-4 text-left">Alert</th>
              <th className="px-6 py-4 text-left">Type</th>
              <th className="px-6 py-4 text-left">Product / Reference</th>
              <th className="px-6 py-4 text-left">Warehouse</th>
              <th className="px-6 py-4 text-left">Date & Time</th>
              <th className="px-6 py-4 text-left">Status</th>
              <th className="px-6 py-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                  No alerts match your filters.
                </td>
              </tr>
            ) : (
              paginated.map((alert) => (
                <tr key={alert.id} className="hover:bg-slate-800/50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-200">{alert.title}</p>
                    <p className="text-xs text-slate-500">{alert.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${alert.typeBadge}`}>{alert.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-300">{alert.product}</p>
                    {alert.productSub && <p className="text-xs text-slate-500">{alert.productSub}</p>}
                  </td>
                  <td className="px-6 py-4">{alert.warehouse}</td>
                  <td className="px-6 py-4">
                    <p className="text-slate-300">{alert.date}</p>
                    <p className="text-xs text-slate-500">{alert.time}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      alert.status === "Resolved"
                        ? "bg-emerald-950 text-emerald-400"
                        : "bg-red-950 text-red-400"
                    }`}>
                      {alert.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setViewAlert(alert)}
                      className="px-3 py-1 border border-slate-600 rounded-lg text-xs text-slate-300 hover:bg-slate-700"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-6 text-sm text-slate-500">
        <p>
          Showing {filtered.length === 0 ? 0 : (safePage - 1) * ITEMS_PER_PAGE + 1} to{" "}
          {Math.min(safePage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} alerts
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => goToPage(safePage - 1)}
            disabled={safePage === 1}
            className="px-3 py-1 rounded-lg border border-slate-600 bg-slate-900 hover:bg-slate-700 disabled:opacity-40 text-slate-300"
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => goToPage(p)}
              className={`px-3 py-1 rounded-lg text-sm ${
                p === safePage
                  ? "bg-indigo-600 text-white"
                  : "border border-slate-600 bg-slate-900 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => goToPage(safePage + 1)}
            disabled={safePage === totalPages}
            className="px-3 py-1 rounded-lg border border-slate-600 bg-slate-900 hover:bg-slate-700 disabled:opacity-40 text-slate-300"
          >
            ›
          </button>
        </div>
      </div>

    </main>
  );
}

export default Alerts;
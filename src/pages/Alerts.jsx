import { useState, useEffect, useCallback } from "react";
import { useSettings } from "./settings";
import apiClient from "../api/client";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

// ─── Real-time data hook ──────────────────────────────────────────────────────

const POLL_MS = 30_000;

function getTypeBadge(type) {
  switch (type) {
    case "Out of Stock":   return "bg-red-950 text-red-400";
    case "Low Stock":      return "bg-yellow-950 text-yellow-400";
    case "Purchase Order": return "bg-blue-950 text-blue-400";
    case "Stock In":       return "bg-emerald-950 text-emerald-400";
    case "Reorder Level":  return "bg-orange-950 text-orange-400";
    default:               return "bg-slate-800 text-slate-400";
  }
}

function formatDate(dateVal) {
  if (!dateVal) return "—";
  return new Date(dateVal).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function formatTime(dateVal) {
  if (!dateVal) return "—";
  return new Date(dateVal).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Each product gets its own individual alert row
function mapProductsToAlerts(products, LOW = 10, REORDER = 5) {
  const alerts = [];
  let id = 1000;

  products.forEach((p) => {
    if (p.quantity === 0) {
      alerts.push({
        id: id++,
        title: "Out of stock",
        description: `${p.product_name} has no remaining stock.`,
        type: "Out of Stock",
        typeBadge: getTypeBadge("Out of Stock"),
        product: p.product_name,
        category: p.category || p.warehouse || "—",
        date: formatDate(p.updatedAt || p.createdAt),
        time: formatTime(p.updatedAt || p.createdAt),
        status: "New",
        severity: "Critical",
      });
    } else if (p.quantity <= REORDER) {
      alerts.push({
        id: id++,
        title: "Reorder level reached",
        description: `${p.product_name} has reached reorder level (${p.quantity} left).`,
        type: "Reorder Level",
        typeBadge: getTypeBadge("Reorder Level"),
        product: p.product_name,
        category: p.category || p.warehouse || "—",
        date: formatDate(p.updatedAt || p.createdAt),
        time: formatTime(p.updatedAt || p.createdAt),
        status: "New",
        severity: "Critical",
      });
    } else if (p.quantity <= LOW) {
      alerts.push({
        id: id++,
        title: "Low stock",
        description: `${p.product_name} is running low (${p.quantity} left).`,
        type: "Low Stock",
        typeBadge: getTypeBadge("Low Stock"),
        product: p.product_name,
        category: p.category || p.warehouse || "—",
        date: formatDate(p.updatedAt || p.createdAt),
        time: formatTime(p.updatedAt || p.createdAt),
        status: "New",
        severity: "Warning",
      });
    }
  });

  return alerts;
}

function mapSalesToAlerts(sales) {
  return (Array.isArray(sales) ? sales : []).map((sale, i) => {
    const qty = Math.abs(parseFloat(sale.quantity_sold) || 0);
    const seller = sale.sold_by
      ? `${sale.sold_by.first_name ?? ""} ${sale.sold_by.last_name ?? ""}`.trim()
      : "";
    return {
      id: 2000 + i,
      title: "Stock out completed",
      description: `${sale.product_name} — ${qty} unit${qty !== 1 ? "s" : ""} sold.`,
      type: "Stock In",
      typeBadge: getTypeBadge("Stock In"),
      product: sale.product_name,
      category: sale.product?.category || "—",
      date: formatDate(sale.createdAt),
      time: formatTime(sale.createdAt),
      status: "Resolved",
      severity: "Info",
    };
  });
}

function mapPOsToAlerts(orders) {
  return (Array.isArray(orders) ? orders : []).map((order, i) => {
    const isDelayed = order.status === "delayed" || !!order.is_delayed;
    return {
      id: 3000 + i,
      title: isDelayed ? "Purchase order delayed" : "Purchase order received",
      description: order.description ||
        (isDelayed
          ? `Expected delivery: ${formatDate(order.expected_date)}`
          : `Supplier: ${order.supplier_name || "—"}`),
      type: "Purchase Order",
      typeBadge: getTypeBadge("Purchase Order"),
      product: order.supplier_name || "—",
      category: order.category || order.warehouse || "—",
      date: formatDate(order.createdAt),
      time: formatTime(order.createdAt),
      status: order.status === "completed" ? "Resolved" : "New",
      severity: isDelayed ? "Warning" : "Info",
    };
  });
}

function useAlertsData() {
  const [alerts, setAlerts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      const productsRes = await apiClient.get("/products");
      const products    = productsRes.data?.data ?? productsRes.data ?? [];

      const salesRes = await apiClient.get("/products/sales/all").catch(() => ({ data: [] }));
      const sales    = salesRes.data?.data ?? salesRes.data ?? [];

      const poRes  = await apiClient.get("/purchase-orders").catch(() => ({ data: [] }));
      const orders = Array.isArray(poRes.data?.data)
        ? poRes.data.data
        : Array.isArray(poRes.data) ? poRes.data : [];

      const combined = [
        ...mapProductsToAlerts(products),
        ...mapSalesToAlerts(sales),
        ...mapPOsToAlerts(orders),
      ].sort((a, b) => (a.status !== b.status ? (a.status === "New" ? -1 : 1) : 0));

      setAlerts(combined);
      setError(null);
    } catch (err) {
      console.error("useAlertsData error:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => {
    const id = setInterval(fetchAll, POLL_MS);
    return () => clearInterval(id);
  }, [fetchAll]);

  return { alerts, loading, error, refreshAlerts: fetchAll };
}

// ─── Constants ────────────────────────────────────────────────────────────────

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

// ─── Shared styles ────────────────────────────────────────────────────────────

const selectClass = "text-xs border border-slate-600 rounded-lg px-2 py-1 outline-none bg-slate-800 text-slate-300";

// ─── Toggle Switch ────────────────────────────────────────────────────────────

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

// ─── Notification Settings Modal ──────────────────────────────────────────────

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
    setTimeout(() => { setSaved(false); onClose(); }, 800);
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

// ─── View Alert Modal ─────────────────────────────────────────────────────────

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
            <span className="text-slate-500">Category</span>
            <span className="text-slate-300">{alert.category}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Date & Time</span>
            <span className="text-slate-300">{alert.date} – {alert.time}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Status</span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              alert.status === "Resolved" ? "bg-emerald-950 text-emerald-400" : "bg-red-950 text-red-400"
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

// ─── Main Component ───────────────────────────────────────────────────────────

function Alerts() {
  const { inventoryToggles } = useSettings();
  const lowStockAlertsEnabled = inventoryToggles["Enable Low Stock Alerts"] ?? true;

  const { alerts: fetchedAlerts, loading: alertsLoading, refreshAlerts } = useAlertsData();
  const [alerts, setAlerts] = useState([]);
  useEffect(() => { setAlerts(fetchedAlerts); }, [fetchedAlerts]);

  const [typeFilter, setTypeFilter]     = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [currentPage, setCurrentPage]   = useState(1);
  const [viewAlert, setViewAlert]       = useState(null);
  const [showNotifSettings, setShowNotifSettings] = useState(false);
  const [notifSettings, setNotifSettings] = useState(loadNotifSettings);

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
    const typeMatch   = typeFilter   === "All Types"  || a.type   === typeFilter;
    const statusMatch = statusFilter === "All Status" || a.status === statusFilter;
    return severityAllowed && typeMatch && statusMatch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage   = Math.min(currentPage, totalPages);
  const paginated  = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const goToPage = (p) => setCurrentPage(Math.max(1, Math.min(p, totalPages)));

  const handleTypeFilter   = (v) => { setTypeFilter(v);   setCurrentPage(1); };
  const handleStatusFilter = (v) => { setStatusFilter(v); setCurrentPage(1); };

  const isFiltered = typeFilter !== "All Types" || statusFilter !== "All Status";

  const clearFilters = () => {
    setTypeFilter("All Types");
    setStatusFilter("All Status");
    setCurrentPage(1);
  };

  const markAllAsRead = () =>
    setAlerts((prev) => prev.map((a) => ({ ...a, status: "Resolved" })));

  const markResolved = (id) =>
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, status: "Resolved" } : a));

  const exportCSV = () => {
    const header = ["ID", "Title", "Type", "Product", "Category", "Date", "Time", "Status", "Severity"];
    const rows = filtered.map((a) => [
      a.id, `"${a.title}"`, a.type, `"${a.product}"`, a.category, a.date, a.time, a.status, a.severity,
    ]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = "alerts.csv"; link.click();
    URL.revokeObjectURL(url);
  };

  // ── Full-screen loading ───────────────────────────────────────────────────
  if (alertsLoading && alerts.length === 0) {
    return (
      <main className="flex-1 min-h-screen bg-slate-800 flex items-center justify-center">
        <p className="text-slate-400 text-sm animate-pulse">Loading alerts...</p>
      </main>
    );
  }

  return (
    <main className="flex-1 min-h-screen bg-slate-800 p-8">

      {/* Modals */}
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

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Alerts</h1>
          <p className="text-sm text-slate-400 mt-1">View and manage all inventory alerts</p>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <button
            onClick={refreshAlerts}
            className="flex items-center gap-2 px-4 py-2 border border-slate-600 rounded-xl bg-slate-900 text-sm font-medium text-slate-300 hover:bg-slate-700"
          >
            ↺ Refresh
          </button>
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

      {/* Stats Cards */}
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

      {/* Disabled severity banner */}
      {(!notifSettings.critical || !notifSettings.warning || !notifSettings.info || !lowStockAlertsEnabled) && (
        <div className="mb-4 px-4 py-3 bg-yellow-950 border border-yellow-800 rounded-xl text-xs text-yellow-400 flex items-center gap-2">
          ⚠️ Some alert types are hidden based on your Notification Settings.
          <button onClick={() => setShowNotifSettings(true)} className="underline font-medium">Manage settings</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center justify-end mb-4 gap-3 flex-wrap">
        <select value={typeFilter} onChange={(e) => handleTypeFilter(e.target.value)} className={selectClass}>
          <option>All Types</option>
          <option>Out of Stock</option>
          <option>Low Stock</option>
          <option>Purchase Order</option>
          <option>Stock In</option>
          <option>Reorder Level</option>
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

      {/* Table */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-x-auto">
        <table className="w-full text-sm text-slate-400">
          <thead className="text-xs text-slate-500 border-b border-slate-700">
            <tr>
              <th className="px-6 py-4 text-left">Alert</th>
              <th className="px-6 py-4 text-left">Type</th>
              <th className="px-6 py-4 text-left">Product</th>
              <th className="px-6 py-4 text-left">Category</th>
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
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-300 capitalize">{alert.category}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-300">{alert.date}</p>
                    <p className="text-xs text-slate-500">{alert.time}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      alert.status === "Resolved" ? "bg-emerald-950 text-emerald-400" : "bg-red-950 text-red-400"
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

      {/* Pagination — matches Products.jsx style */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '20px', gap: '12px' }}>
          <button
            onClick={() => goToPage(safePage - 1)}
            disabled={safePage === 1}
            style={{
              display: 'flex', alignItems: 'center',
              backgroundColor: '#0f172a', border: '1px solid #334155',
              borderRadius: '8px', color: '#94a3b8', padding: '8px', cursor: 'pointer',
              opacity: safePage === 1 ? 0.4 : 1,
            }}
          >
            <FiChevronLeft size={18} />
          </button>
          <span style={{ fontSize: '14px', color: '#94a3b8' }}>
            Page <strong style={{ color: '#f8fafc' }}>{safePage}</strong> of {totalPages}
          </span>
          <button
            onClick={() => goToPage(safePage + 1)}
            disabled={safePage === totalPages}
            style={{
              display: 'flex', alignItems: 'center',
              backgroundColor: '#0f172a', border: '1px solid #334155',
              borderRadius: '8px', color: '#94a3b8', padding: '8px', cursor: 'pointer',
              opacity: safePage === totalPages ? 0.4 : 1,
            }}
          >
            <FiChevronRight size={18} />
          </button>
        </div>
      )}

    </main>
  );
}

export default Alerts;
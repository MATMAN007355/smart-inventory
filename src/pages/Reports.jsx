import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell,
} from "recharts";

// ─── Data ─────────────────────────────────────────────────────────────────────

const ALL_REPORTS = [
  { id: 1,  name: "Inventory Summary Report",    type: "Inventory Reports",   date: "May 18, 2024 10:30 AM", format: "PDF",   status: "Completed"  },
  { id: 2,  name: "Stock Movement Report",       type: "Stock Movement",      date: "May 17, 2024 04:15 PM", format: "Excel", status: "Completed"  },
  { id: 3,  name: "Low Stock Items Report",      type: "Inventory Reports",   date: "May 17, 2024 09:20 AM", format: "PDF",   status: "Completed"  },
  { id: 4,  name: "Purchase Order Report",       type: "Transaction Reports", date: "May 16, 2024 03:45 PM", format: "Excel", status: "Completed"  },
  { id: 5,  name: "Supplier Performance Report", type: "Supplier Reports",    date: "May 16, 2024 11:30 AM", format: "PDF",   status: "Processing" },
  { id: 6,  name: "Overstock Analysis Report",   type: "Inventory Reports",   date: "May 15, 2024 02:00 PM", format: "PDF",   status: "Completed"  },
  { id: 7,  name: "Weekly Stock Movement",       type: "Stock Movement",      date: "May 15, 2024 09:00 AM", format: "Excel", status: "Completed"  },
  { id: 8,  name: "Reorder Level Report",        type: "Inventory Reports",   date: "May 14, 2024 11:00 AM", format: "PDF",   status: "Completed"  },
  { id: 9,  name: "Transaction Summary",         type: "Transaction Reports", date: "May 14, 2024 08:30 AM", format: "Excel", status: "Completed"  },
  { id: 10, name: "Supplier Scorecard",          type: "Supplier Reports",    date: "May 13, 2024 03:00 PM", format: "PDF",   status: "Completed"  },
  { id: 11, name: "Dead Stock Report",           type: "Inventory Reports",   date: "May 13, 2024 10:00 AM", format: "PDF",   status: "Completed"  },
  { id: 12, name: "Inbound Shipments Log",       type: "Stock Movement",      date: "May 12, 2024 04:00 PM", format: "Excel", status: "Completed"  },
  { id: 13, name: "PO Variance Report",          type: "Transaction Reports", date: "May 12, 2024 01:00 PM", format: "PDF",   status: "Completed"  },
  { id: 14, name: "Category Performance",        type: "Other Reports",       date: "May 11, 2024 09:00 AM", format: "PDF",   status: "Completed"  },
  { id: 15, name: "Outbound Shipments Log",      type: "Stock Movement",      date: "May 10, 2024 02:30 PM", format: "Excel", status: "Completed"  },
];

const OVERVIEW_DATA = {
  "7 Days": [
    { day: "May 12", reports: 2 },
    { day: "May 13", reports: 3 },
    { day: "May 14", reports: 2 },
    { day: "May 15", reports: 4 },
    { day: "May 16", reports: 3 },
    { day: "May 17", reports: 5 },
    { day: "May 18", reports: 3 },
  ],
  "30 Days": Array.from({ length: 30 }, (_, i) => ({
    day: `May ${i + 1}`,
    reports: Math.floor(Math.random() * 5 + 1),
  })),
};

const BY_TYPE_DATA = [
  { name: "Inventory Reports",   value: 40, count: 10, color: "#6366f1" },
  { name: "Stock Movement",      value: 25, count: 6,  color: "#10b981" },
  { name: "Transaction Reports", value: 20, count: 5,  color: "#eab308" },
  { name: "Supplier Reports",    value: 10, count: 2,  color: "#ef4444" },
  { name: "Other Reports",       value: 5,  count: 1,  color: "#475569" },
];

const REPORT_TYPES = ["Inventory Reports", "Stock Movement", "Transaction Reports", "Supplier Reports", "Other Reports"];

// ─── Shared styles ────────────────────────────────────────────────────────────

const cardClass = "bg-slate-900 border border-slate-700 rounded-xl p-6";
const selectClass = "text-xs border border-slate-600 rounded-lg px-2 py-1 outline-none bg-slate-800 text-slate-300";
const tooltipStyle = { backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px", color: "#94a3b8" };
const inputClass = "w-full border border-slate-600 rounded-xl px-3 py-2 text-sm outline-none bg-slate-800 text-slate-200 placeholder-slate-500 focus:border-indigo-500";
const labelClass = "text-xs text-slate-500 mb-1 block";

// ─── Generate Report Modal ────────────────────────────────────────────────────

function GenerateReportModal({ onClose, onGenerate }) {
  const [form, setForm] = useState({ name: "", type: "Inventory Reports", format: "PDF", dateFrom: "", dateTo: "" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.name.trim()) return alert("Please enter a report name.");
    onGenerate(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-slate-100">Generate New Report</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-xl leading-none">✕</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Report Name</label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Monthly Inventory Summary"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Report Type</label>
            <select value={form.type} onChange={(e) => set("type", e.target.value)} className={`${inputClass} cursor-pointer`}>
              {REPORT_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Format</label>
            <div className="flex gap-3">
              {["PDF", "Excel"].map((f) => (
                <button
                  key={f}
                  onClick={() => set("format", f)}
                  className={`flex-1 py-2 text-sm rounded-xl border transition-colors ${
                    form.format === f
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "border-slate-600 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className={labelClass}>Date From</label>
              <input type="date" value={form.dateFrom} onChange={(e) => set("dateFrom", e.target.value)} className={inputClass} />
            </div>
            <div className="flex-1">
              <label className={labelClass}>Date To</label>
              <input type="date" value={form.dateTo} onChange={(e) => set("dateTo", e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={handleSubmit} className="flex-1 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-500">Generate</button>
          <button onClick={onClose} className="flex-1 py-2 border border-slate-600 text-sm text-slate-300 rounded-xl hover:bg-slate-700">Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── Schedule Report Modal ────────────────────────────────────────────────────

function ScheduleReportModal({ onClose }) {
  const [form, setForm] = useState({ type: "Inventory Reports", frequency: "Weekly", time: "08:00", format: "PDF" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 bg-slate-950/70 flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-slate-100">Schedule Automated Report</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-xl leading-none">✕</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Report Type</label>
            <select value={form.type} onChange={(e) => set("type", e.target.value)} className={`${inputClass} cursor-pointer`}>
              {REPORT_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Frequency</label>
            <div className="flex gap-2 flex-wrap">
              {["Daily", "Weekly", "Monthly"].map((f) => (
                <button
                  key={f}
                  onClick={() => set("frequency", f)}
                  className={`px-4 py-2 text-sm rounded-xl border transition-colors ${
                    form.frequency === f
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "border-slate-600 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelClass}>Send Time</label>
            <input type="time" value={form.time} onChange={(e) => set("time", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Format</label>
            <div className="flex gap-3">
              {["PDF", "Excel"].map((f) => (
                <button key={f} onClick={() => set("format", f)}
                  className={`flex-1 py-2 text-sm rounded-xl border transition-colors ${
                    form.format === f
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "border-slate-600 text-slate-400 hover:bg-slate-700"
                  }`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-500">Save Schedule</button>
          <button onClick={onClose} className="flex-1 py-2 border border-slate-600 text-sm text-slate-300 rounded-xl hover:bg-slate-700">Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── Custom Report Modal ──────────────────────────────────────────────────────

function CustomReportModal({ onClose, onGenerate }) {
  const [selected, setSelected] = useState([]);
  const [format, setFormat] = useState("PDF");
  const fields = ["Inventory Value", "Stock Levels", "Turnover Rate", "Supplier Data", "Sales Data", "Transaction History", "Demand Forecast"];

  const toggle = (f) => setSelected((s) => s.includes(f) ? s.filter((x) => x !== f) : [...s, f]);

  const handleSubmit = () => {
    if (!selected.length) return alert("Select at least one field.");
    onGenerate({ name: "Custom Report", type: "Other Reports", format, fields: selected });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-slate-100">Custom Report Builder</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-xl leading-none">✕</button>
        </div>
        <p className="text-xs text-slate-500 mb-3">Select the fields to include in your custom report:</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {fields.map((f) => (
            <button
              key={f}
              onClick={() => toggle(f)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                selected.includes(f)
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "border-slate-600 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div>
          <label className={labelClass}>Format</label>
          <div className="flex gap-3">
            {["PDF", "Excel"].map((f) => (
              <button key={f} onClick={() => setFormat(f)}
                className={`flex-1 py-2 text-sm rounded-xl border transition-colors ${
                  format === f
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "border-slate-600 text-slate-400 hover:bg-slate-700"
                }`}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={handleSubmit} className="flex-1 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-500">Build Report</button>
          <button onClick={onClose} className="flex-1 py-2 border border-slate-600 text-sm text-slate-300 rounded-xl hover:bg-slate-700">Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── All Reports Modal ────────────────────────────────────────────────────────

function AllReportsModal({ reports, categoryFilter, onClose }) {
  const [filter, setFilter] = useState(categoryFilter || "All");
  const filtered = filter === "All" ? reports : reports.filter((r) => r.type === filter);

  return (
    <div className="fixed inset-0 bg-slate-950/70 flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-slate-100">All Reports</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-xl leading-none">✕</button>
        </div>
        <div className="flex gap-2 flex-wrap mb-4">
          {["All", ...REPORT_TYPES].map((t) => (
            <button key={t} onClick={() => setFilter(t)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                filter === t
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "border-slate-600 text-slate-400 hover:bg-slate-700"
              }`}>
              {t}
            </button>
          ))}
        </div>
        <table className="w-full text-sm text-slate-400">
          <thead className="text-xs text-slate-500 border-b border-slate-700">
            <tr>
              <th className="text-left pb-3">Report Name</th>
              <th className="text-left pb-3">Type</th>
              <th className="text-left pb-3">Date</th>
              <th className="text-left pb-3">Format</th>
              <th className="text-left pb-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-slate-700/30">
                <td className="py-3 text-slate-200">{r.name}</td>
                <td className="py-3 text-xs text-slate-500">{r.type}</td>
                <td className="py-3 text-xs text-slate-500">{r.date}</td>
                <td className="py-3 text-xs text-slate-500">{r.format}</td>
                <td className="py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    r.status === "Completed"
                      ? "bg-emerald-950 text-emerald-400"
                      : "bg-yellow-950 text-yellow-400"
                  }`}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={onClose} className="mt-6 w-full py-2 border border-slate-600 text-sm text-slate-300 rounded-xl hover:bg-slate-700">Close</button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function Reports() {
  const [reports,        setReports]       = useState(ALL_REPORTS);
  const [overviewRange,  setOverviewRange] = useState("7 Days");
  const [showGenerate,   setShowGenerate]  = useState(false);
  const [showSchedule,   setShowSchedule]  = useState(false);
  const [showCustom,     setShowCustom]    = useState(false);
  const [showAllReports, setShowAllReports] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState(null);

  const totalReports   = reports.length;
  const generatedMonth = reports.filter((r) => r.date.includes("May 2024")).length;
  const lastReport     = reports[0];

  const handleGenerate = (form) => {
    const now = new Date();
    const newReport = {
      id: Date.now(),
      name: form.name,
      type: form.type,
      date: now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + " " +
            now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      format: form.format,
      status: "Processing",
    };
    setReports((prev) => [newReport, ...prev]);
    setTimeout(() => {
      setReports((prev) => prev.map((r) => r.id === newReport.id ? { ...r, status: "Completed" } : r));
    }, 3000);
  };

  const exportData = () => {
    const header = ["ID", "Report Name", "Type", "Date Generated", "Format", "Status"];
    const rows = reports.map((r) => [r.id, `"${r.name}"`, r.type, r.date, r.format, r.status]);
    const csv  = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = "reports-export.csv"; link.click();
    URL.revokeObjectURL(url);
  };

  const openCategory = (cat) => { setCategoryFilter(cat); setShowAllReports(true); };
  const recentReports = reports.slice(0, 5);

  return (
    <main className="flex-1 bg-slate-800 p-8">

      {/* Modals */}
      {showGenerate   && <GenerateReportModal  onClose={() => setShowGenerate(false)}  onGenerate={handleGenerate} />}
      {showSchedule   && <ScheduleReportModal  onClose={() => setShowSchedule(false)}  />}
      {showCustom     && <CustomReportModal    onClose={() => setShowCustom(false)}    onGenerate={handleGenerate} />}
      {showAllReports && <AllReportsModal      reports={reports} categoryFilter={categoryFilter} onClose={() => { setShowAllReports(false); setCategoryFilter(null); }} />}

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Reports</h1>
          <p className="text-sm text-slate-400 mt-1">View and analyze your inventory reports</p>
        </div>
        <button
          onClick={() => setShowGenerate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-500 mt-1"
        >
          + Generate Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-900 border border-slate-700 p-5 rounded-xl">
          <p className="text-xs text-slate-400 mb-1">Total Reports</p>
          <p className="text-3xl font-bold text-slate-100">{totalReports}</p>
          <p className="text-xs text-emerald-400 mt-1">▲ 20% vs last month</p>
        </div>
        <div className="bg-slate-900 border border-slate-700 p-5 rounded-xl">
          <p className="text-xs text-slate-400 mb-1">Generated This Month</p>
          <p className="text-3xl font-bold text-slate-100">{generatedMonth}</p>
          <p className="text-xs text-emerald-400 mt-1">▲ 14% vs last month</p>
        </div>
        <div className="bg-slate-900 border border-slate-700 p-5 rounded-xl">
          <p className="text-xs text-slate-400 mb-1">Downloads</p>
          <p className="text-3xl font-bold text-slate-100">156</p>
          <p className="text-xs text-emerald-400 mt-1">▲ 12% vs last month</p>
        </div>
        <div className="bg-slate-900 border border-slate-700 p-5 rounded-xl">
          <p className="text-xs text-slate-400 mb-1">Last Generated</p>
          <p className="text-2xl font-bold text-slate-100">
            {lastReport ? lastReport.date.split(" ").slice(0, 3).join(" ") : "—"}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {lastReport ? lastReport.date.split(" ").slice(3).join(" ") : ""}
          </p>
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Reports Overview */}
        <div className={`${cardClass} h-72`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-200">Reports Overview</h2>
            <select value={overviewRange} onChange={(e) => setOverviewRange(e.target.value)} className={selectClass}>
              <option>7 Days</option>
              <option>30 Days</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height="82%">
            <LineChart data={OVERVIEW_DATA[overviewRange]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#475569" }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10, fill: "#475569" }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [v, "Reports"]} />
              <Line type="monotone" dataKey="reports" stroke="#6366f1" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Reports by Type */}
        <div className={`${cardClass} h-72`}>
          <h2 className="text-sm font-semibold text-slate-200 mb-4">Reports by Type</h2>
          <div className="flex items-center gap-4">
            <div className="w-32 h-32 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={BY_TYPE_DATA} cx="50%" cy="50%" innerRadius={28} outerRadius={52} dataKey="value" paddingAngle={3}>
                    {BY_TYPE_DATA.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v, name) => [`${v}%`, name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex justify-between gap-4"><span>🔵 Inventory Reports</span><span>40% (10)</span></li>
              <li className="flex justify-between gap-4"><span>🟢 Stock Movement</span><span>25% (6)</span></li>
              <li className="flex justify-between gap-4"><span>🟡 Transaction Reports</span><span>20% (5)</span></li>
              <li className="flex justify-between gap-4"><span>🔴 Supplier Reports</span><span>10% (2)</span></li>
              <li className="flex justify-between gap-4"><span>⚫ Other Reports</span><span>5% (1)</span></li>
            </ul>
          </div>
          <div className="flex justify-between mt-4 text-sm font-semibold text-slate-200 border-t border-slate-700 pt-3">
            <span>Total</span>
            <span>{totalReports}</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`${cardClass} h-72 flex flex-col`}>
          <h2 className="text-sm font-semibold text-slate-200 mb-4">Quick Actions</h2>
          <ul className="space-y-1 overflow-y-auto flex-1 pr-1">
            <li onClick={() => setShowGenerate(true)} className="flex items-start gap-3 cursor-pointer hover:bg-slate-800 p-2 rounded-xl transition-colors">
              <div className="bg-slate-700 p-2 rounded-lg text-lg">➕</div>
              <div>
                <p className="text-sm font-medium text-slate-200">Generate Report</p>
                <p className="text-xs text-slate-500">Create a new report</p>
              </div>
            </li>
            <li onClick={() => setShowSchedule(true)} className="flex items-start gap-3 cursor-pointer hover:bg-slate-800 p-2 rounded-xl transition-colors">
              <div className="bg-slate-700 p-2 rounded-lg text-lg">📅</div>
              <div>
                <p className="text-sm font-medium text-slate-200">Schedule Report</p>
                <p className="text-xs text-slate-500">Set up automated reports</p>
              </div>
            </li>
            <li onClick={exportData} className="flex items-start gap-3 cursor-pointer hover:bg-slate-800 p-2 rounded-xl transition-colors">
              <div className="bg-slate-700 p-2 rounded-lg text-lg">⬇️</div>
              <div>
                <p className="text-sm font-medium text-slate-200">Export Data</p>
                <p className="text-xs text-slate-500">Export report data</p>
              </div>
            </li>
            <li onClick={() => setShowCustom(true)} className="flex items-start gap-3 cursor-pointer hover:bg-slate-800 p-2 rounded-xl transition-colors">
              <div className="bg-slate-700 p-2 rounded-lg text-lg">📋</div>
              <div>
                <p className="text-sm font-medium text-slate-200">Custom Report</p>
                <p className="text-xs text-slate-500">Create custom report</p>
              </div>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Reports Table */}
        <div className={`${cardClass} lg:col-span-2`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-200">Recent Reports</h2>
            <button
              onClick={() => { setCategoryFilter(null); setShowAllReports(true); }}
              className="text-xs text-indigo-400 hover:underline"
            >
              View all
            </button>
          </div>
          <table className="w-full text-sm text-slate-400">
            <thead className="text-xs text-slate-500 border-b border-slate-700">
              <tr>
                <th className="text-left pb-3">Report Name</th>
                <th className="text-left pb-3">Type</th>
                <th className="text-left pb-3">Date Generated</th>
                <th className="text-left pb-3">Format</th>
                <th className="text-left pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {recentReports.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/50">
                  <td className="py-3 text-slate-200">{r.name}</td>
                  <td className="py-3 text-xs text-slate-500">{r.type}</td>
                  <td className="py-3 text-xs text-slate-500">{r.date}</td>
                  <td className="py-3 text-xs text-slate-500">{r.format}</td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      r.status === "Completed"
                        ? "bg-emerald-950 text-emerald-400"
                        : "bg-yellow-950 text-yellow-400"
                    }`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={() => { setCategoryFilter(null); setShowAllReports(true); }}
            className="text-xs text-indigo-400 mt-4 hover:underline w-full text-center"
          >
            View all reports
          </button>
        </div>

        {/* Report Categories */}
        <div className={cardClass}>
          <h2 className="text-sm font-semibold text-slate-200 mb-4">Report Categories</h2>
          <ul className="space-y-1">
            {[
              { type: "Inventory Reports",   icon: "📄" },
              { type: "Stock Movement",      icon: "📦" },
              { type: "Transaction Reports", icon: "🔄" },
              { type: "Supplier Reports",    icon: "🤝" },
              { type: "Other Reports",       icon: "📊" },
            ].map(({ type, icon }) => (
              <li
                key={type}
                onClick={() => openCategory(type)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{icon}</span>
                  <span className="text-sm text-slate-300">{type}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span>{reports.filter((r) => r.type === type).length}</span>
                  <span>›</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

      </div>

    </main>
  );
}

export default Reports;
import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar,
} from "recharts";
import { useSettings } from "./settings";

const INVENTORY_VALUE = {
  "7 Days": [
    { day: "May 12", value: 218000 },
    { day: "May 13", value: 224000 },
    { day: "May 14", value: 219500 },
    { day: "May 15", value: 231000 },
    { day: "May 16", value: 228000 },
    { day: "May 17", value: 239000 },
    { day: "May 18", value: 245680 },
  ],
  "30 Days": Array.from({ length: 30 }, (_, i) => ({
    day: `May ${i + 1}`,
    value: 200000 + Math.round(Math.random() * 50000 + i * 1500),
  })),
};

const TURNOVER_TREND = {
  "7 Days": [
    { day: "May 12", ratio: 5.2 },
    { day: "May 13", ratio: 5.8 },
    { day: "May 14", ratio: 5.5 },
    { day: "May 15", ratio: 6.1 },
    { day: "May 16", ratio: 6.4 },
    { day: "May 17", ratio: 6.6 },
    { day: "May 18", ratio: 6.8 },
  ],
  "30 Days": Array.from({ length: 30 }, (_, i) => ({
    day: `May ${i + 1}`,
    ratio: +(4.5 + Math.random() * 2.5 + i * 0.07).toFixed(2),
  })),
};

const TOP_CATEGORIES = {
  "7 Days": [
    { name: "Electronics", value: 38 },
    { name: "Furniture", value: 24 },
    { name: "Office Supplies", value: 18 },
    { name: "Food & Bev", value: 12 },
    { name: "Other", value: 8 },
  ],
  "30 Days": [
    { name: "Electronics", value: 42 },
    { name: "Furniture", value: 21 },
    { name: "Office Supplies", value: 16 },
    { name: "Food & Bev", value: 14 },
    { name: "Other", value: 7 },
  ],
};

const STOCK_STATUS = {
  "7 Days": [
    { name: "In Stock",     value: 782, color: "#22c55e" },
    { name: "Low Stock",    value: 229, color: "#eab308" },
    { name: "Out of Stock", value: 150, color: "#ef4444" },
    { name: "Overstock",    value: 87,  color: "#6366f1" },
  ],
};

const INVENTORY_AGE = {
  "All Items": [
    { range: "0–30d",   count: 420 },
    { range: "31–60d",  count: 310 },
    { range: "61–90d",  count: 215 },
    { range: "91–120d", count: 178 },
    { range: "120d+",   count: 125 },
  ],
  "Electronics": [
    { range: "0–30d",   count: 120 },
    { range: "31–60d",  count: 95 },
    { range: "61–90d",  count: 60 },
    { range: "91–120d", count: 40 },
    { range: "120d+",   count: 22 },
  ],
  "Furniture": [
    { range: "0–30d",   count: 80 },
    { range: "31–60d",  count: 70 },
    { range: "61–90d",  count: 55 },
    { range: "91–120d", count: 48 },
    { range: "120d+",   count: 35 },
  ],
};

const DEMAND_FORECAST = {
  "14 Days": Array.from({ length: 14 }, (_, i) => ({
    day: `Day ${i + 1}`,
    forecast: Math.round(180 + Math.sin(i * 0.5) * 40 + i * 3),
    actual: i < 7 ? Math.round(170 + Math.sin(i * 0.5) * 35 + i * 3) : null,
  })),
  "30 Days": Array.from({ length: 30 }, (_, i) => ({
    day: `Day ${i + 1}`,
    forecast: Math.round(180 + Math.sin(i * 0.4) * 50 + i * 2),
    actual: i < 15 ? Math.round(175 + Math.sin(i * 0.4) * 45 + i * 2) : null,
  })),
  "60 Days": Array.from({ length: 60 }, (_, i) => ({
    day: `Day ${i + 1}`,
    forecast: Math.round(180 + Math.sin(i * 0.3) * 60 + i * 1.5),
    actual: i < 30 ? Math.round(175 + Math.sin(i * 0.3) * 55 + i * 1.5) : null,
  })),
};

const SLOW_MOVING_ALL = [
  { product: "Ergonomic Chair",     days: 145, value: 1150.00 },
  { product: "Wireless Keyboard",   days: 132, value: 680.00  },
  { product: "Bluetooth Speaker",   days: 120, value: 450.00  },
  { product: "Desk Lamp",           days: 115, value: 320.00  },
  { product: "Office Table",        days: 110, value: 2100.00 },
  { product: "USB-C Hub",           days: 105, value: 210.00  },
  { product: "Monitor Stand",       days: 98,  value: 175.00  },
  { product: "Cable Organizer",     days: 92,  value: 90.00   },
  { product: "Whiteboard",          days: 88,  value: 340.00  },
  { product: "Printer Paper (Box)", days: 85,  value: 65.00   },
];

const INSIGHTS = [
  {
    id: 1,
    label: "Reduce Overstock",
    color: "text-emerald-400",
    summary: "23 items are overstocked. Potential to reduce inventory value by $8,240.",
    detail: "The following categories have excess stock beyond 90 days of projected demand: Furniture (8 SKUs), Office Supplies (11 SKUs), and Electronics (4 SKUs). Recommended actions: run a promotional discount of 15–20% on furniture, pause reorder triggers for office supplies, and reallocate electronics to Warehouse B.",
  },
  {
    id: 2,
    label: "Reorder Soon",
    color: "text-amber-400",
    summary: "18 items are likely to run out of stock in the next 7 days.",
    detail: "Based on current sales velocity, the following items will hit zero stock within 7 days: Wireless Earbuds (WE-1001), Premium Coffee Beans (CF-2002), and 16 other SKUs. Recommended: raise POs for these items immediately to avoid stockout penalties estimated at $4,350.",
  },
  {
    id: 3,
    label: "High Demand",
    color: "text-indigo-400",
    summary: "Electronics category is trending up by 18.5% this week.",
    detail: "Electronics sales have risen 18.5% week-over-week, driven primarily by USB accessories (+34%) and wireless audio (+22%). Consider increasing safety stock levels by 20% for top-selling electronics SKUs and reviewing supplier lead times to ensure supply can meet projected demand over the next 30 days.",
  },
];

const DONUT_COLORS = ["#6366f1", "#f59e0b", "#10b981", "#3b82f6", "#f43f5e"];

function getCurrencySymbol(currency) {
  if (currency.includes("EUR")) return "€";
  if (currency.includes("GBP")) return "£";
  return "$";
}

function formatCurrency(symbol, value) {
  return `${symbol}${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const cardClass  = "bg-slate-900 border border-slate-700 rounded-xl p-6";
const selectClass = "text-xs border border-slate-600 rounded-lg px-2 py-1 outline-none bg-slate-800 text-slate-300";
const tooltipStyle = { backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px", color: "#94a3b8" };

function InventoryAnalysisTab() {
  return (
    <div className={`${cardClass} text-sm text-slate-400`}>
      <h2 className="font-semibold text-slate-200 mb-4">Inventory Analysis</h2>
      <p>Detailed inventory breakdown by category, location, and SKU performance would appear here.</p>
    </div>
  );
}
function SalesAnalysisTab() {
  return (
    <div className={`${cardClass} text-sm text-slate-400`}>
      <h2 className="font-semibold text-slate-200 mb-4">Sales Analysis</h2>
      <p>Sales trends, top products, and revenue breakdowns would appear here.</p>
    </div>
  );
}
function SupplierPerformanceTab() {
  return (
    <div className={`${cardClass} text-sm text-slate-400`}>
      <h2 className="font-semibold text-slate-200 mb-4">Supplier Performance</h2>
      <p>On-time delivery rates, defect rates, and supplier scorecards would appear here.</p>
    </div>
  );
}
function DemandForecastTab() {
  return (
    <div className={`${cardClass} text-sm text-slate-400`}>
      <h2 className="font-semibold text-slate-200 mb-4">Demand Forecast</h2>
      <p>AI-driven demand predictions by SKU, category, and warehouse would appear here.</p>
    </div>
  );
}

function InsightModal({ insight, onClose }) {
  return (
    <div className="fixed inset-0 bg-slate-950/70 flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-base font-semibold ${insight.color}`}>{insight.label}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-xl leading-none">✕</button>
        </div>
        <p className="text-sm text-slate-400 mb-3">{insight.summary}</p>
        <p className="text-sm text-slate-300 leading-relaxed">{insight.detail}</p>
        <button
          onClick={onClose}
          className="mt-6 w-full py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-500"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function AllInsightsModal({ onClose }) {
  const [active, setActive] = useState(null);
  return (
    <div className="fixed inset-0 bg-slate-950/70 flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-slate-100">💡 All Insights & Recommendations</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-xl leading-none">✕</button>
        </div>
        <ul className="space-y-4">
          {INSIGHTS.map((ins) => (
            <li key={ins.id} className="border border-slate-700 rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className={`font-semibold text-sm ${ins.color}`}>{ins.label}</p>
                  <p className="text-xs text-slate-500 mt-1">{ins.summary}</p>
                </div>
                <button
                  onClick={() => setActive(ins)}
                  className="text-xs text-indigo-400 hover:underline whitespace-nowrap"
                >
                  View details
                </button>
              </div>
            </li>
          ))}
        </ul>
        <button
          onClick={onClose}
          className="mt-6 w-full py-2 border border-slate-600 text-sm text-slate-300 rounded-xl hover:bg-slate-700"
        >
          Close
        </button>
      </div>
      {active && <InsightModal insight={active} onClose={() => setActive(null)} />}
    </div>
  );
}

function SlowMovingModal({ onClose, symbol }) {
  return (
    <div className="fixed inset-0 bg-slate-950/70 flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-slate-100">Slow Moving Items (All)</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-xl leading-none">✕</button>
        </div>
        <table className="w-full text-sm text-slate-400">
          <thead>
            <tr className="text-xs text-slate-500 border-b border-slate-700">
              <th className="text-left pb-2">Product</th>
              <th className="text-left pb-2">Days in Stock</th>
              <th className="text-right pb-2">Inventory Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {SLOW_MOVING_ALL.map((item) => (
              <tr key={item.product}>
                <td className="py-2 text-slate-200">{item.product}</td>
                <td className="py-2">{item.days}</td>
                <td className="py-2 text-right">{formatCurrency(symbol, item.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          onClick={onClose}
          className="mt-6 w-full py-2 border border-slate-600 text-sm text-slate-300 rounded-xl hover:bg-slate-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function Analytics() {

  const { currency, lowStockThreshold } = useSettings();
  const symbol = getCurrencySymbol(currency);

  const [activeTab,        setActiveTab]        = useState("Overview");
  const [invValueRange,    setInvValueRange]    = useState("7 Days");
  const [turnoverRange,    setTurnoverRange]    = useState("7 Days");
  const [categoriesRange,  setCategoriesRange]  = useState("7 Days");
  const [stockStatusRange, setStockStatusRange] = useState("7 Days");
  const [ageFilter,        setAgeFilter]        = useState("All Items");
  const [demandRange,      setDemandRange]      = useState("14 Days");
  const [insightModal,     setInsightModal]     = useState(null);
  const [showAllInsights,  setShowAllInsights]  = useState(false);
  const [showSlowMoving,   setShowSlowMoving]   = useState(false);

  const exportReport = () => {
    const rows = [
      ["Metric", "Value"],
      ["Total Inventory Value", formatCurrency(symbol, 245680)],
      ["Gross Margin", "32.6%"],
      ["Inventory Turnover Ratio", "6.8x"],
      ["Stockout Cost", formatCurrency(symbol, 4350)],
      ["Forecast Accuracy", "87.6%"],
      [],
      ["Slow Moving Items"],
      ["Product", "Days in Stock", "Inventory Value"],
      ...SLOW_MOVING_ALL.map((i) => [i.product, i.days, formatCurrency(symbol, i.value)]),
    ];
    const csv  = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = "analytics-report.csv"; link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="flex-1 bg-slate-800 p-8">

      {insightModal    && <InsightModal insight={insightModal} onClose={() => setInsightModal(null)} />}
      {showAllInsights && <AllInsightsModal onClose={() => setShowAllInsights(false)} />}
      {showSlowMoving  && <SlowMovingModal  onClose={() => setShowSlowMoving(false)} symbol={symbol} />}

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Analytics & Intelligence</h1>
          <p className="text-sm text-slate-400 mt-1">Data-driven insights to optimize your inventory performance.</p>
        </div>
        <button
          onClick={exportReport}
          className="flex items-center gap-2 px-4 py-2 border border-slate-600 rounded-xl bg-slate-900 text-sm font-medium text-slate-300 hover:bg-slate-700 mt-1"
        >
          ⬇️ Export Report
        </button>
      </div>

      <div className="flex items-center gap-6 border-b border-slate-700 mb-6 text-sm font-medium text-slate-500">
        {["Overview", "Inventory Analysis", "Sales Analysis", "Supplier Performance", "Demand Forecast"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
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

      {activeTab === "Inventory Analysis"   && <InventoryAnalysisTab />}
      {activeTab === "Sales Analysis"       && <SalesAnalysisTab />}
      {activeTab === "Supplier Performance" && <SupplierPerformanceTab />}
      {activeTab === "Demand Forecast"      && <DemandForecastTab />}

      {activeTab === "Overview" && <>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl">
            <p className="text-xs text-slate-400 mb-1">Total Inventory Value</p>
            <p className="text-xl font-bold text-slate-100">{formatCurrency(symbol, 245680)}</p>
            <p className="text-xs text-emerald-400 mt-1">▲ 12.5% vs previous 7 days</p>
          </div>
          <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl">
            <p className="text-xs text-slate-400 mb-1">Gross Margin</p>
            <p className="text-xl font-bold text-slate-100">32.6%</p>
            <p className="text-xs text-emerald-400 mt-1">▲ 4.2% vs previous 7 days</p>
          </div>
          <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl">
            <p className="text-xs text-slate-400 mb-1">Inventory Turnover Ratio</p>
            <p className="text-xl font-bold text-slate-100">6.8x</p>
            <p className="text-xs text-emerald-400 mt-1">▲ 1.3x vs previous 7 days</p>
          </div>
          <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl">
            <p className="text-xs text-slate-400 mb-1">Stockout Cost</p>
            <p className="text-xl font-bold text-slate-100">{formatCurrency(symbol, 4350)}</p>
            <p className="text-xs text-red-400 mt-1">▼ 8.7% vs previous 7 days</p>
          </div>
          <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl">
            <p className="text-xs text-slate-400 mb-1">Forecast Accuracy</p>
            <p className="text-xl font-bold text-slate-100">87.6%</p>
            <p className="text-xs text-emerald-400 mt-1">▲ 5.4% vs previous 7 days</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          <div className={`${cardClass} h-64`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-200">Inventory Value Over Time</h2>
              <select value={invValueRange} onChange={(e) => setInvValueRange(e.target.value)} className={selectClass}>
                <option>7 Days</option>
                <option>30 Days</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height="75%">
              <LineChart data={INVENTORY_VALUE[invValueRange]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#475569" }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10, fill: "#475569" }} tickFormatter={(v) => `${symbol}${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${formatCurrency(symbol, v)}`, "Value"]} />
                <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className={`${cardClass} h-64`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-200">Inventory Turnover Trend</h2>
              <select value={turnoverRange} onChange={(e) => setTurnoverRange(e.target.value)} className={selectClass}>
                <option>7 Days</option>
                <option>30 Days</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height="75%">
              <LineChart data={TURNOVER_TREND[turnoverRange]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#475569" }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10, fill: "#475569" }} tickFormatter={(v) => `${v}x`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}x`, "Turnover"]} />
                <Line type="monotone" dataKey="ratio" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className={`${cardClass} h-64`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-200">Top Performing Categories</h2>
              <select value={categoriesRange} onChange={(e) => setCategoriesRange(e.target.value)} className={selectClass}>
                <option>7 Days</option>
                <option>30 Days</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height="75%">
              <PieChart>
                <Pie
                  data={TOP_CATEGORIES[categoriesRange]}
                  cx="50%" cy="50%"
                  innerRadius={40} outerRadius={65}
                  dataKey="value"
                  paddingAngle={3}
                >
                  {TOP_CATEGORIES[categoriesRange].map((_, i) => (
                    <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, "Share"]} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10, color: "#94a3b8" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          <div className={cardClass}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-200">Stock Status Distribution</h2>
              <select value={stockStatusRange} onChange={(e) => setStockStatusRange(e.target.value)} className={selectClass}>
                <option>7 Days</option>
              </select>
            </div>
            <div className="flex items-center justify-center h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={STOCK_STATUS[stockStatusRange]}
                    cx="50%" cy="50%"
                    innerRadius={30} outerRadius={55}
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {STOCK_STATUS[stockStatusRange].map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v, name) => [v, name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li className="flex justify-between"><span>🟢 In Stock</span><span>782 (62.7%)</span></li>
              <li className="flex justify-between"><span>🟡 Low Stock</span><span>{lowStockThreshold} threshold · 23 items</span></li>
              <li className="flex justify-between"><span>🔴 Out of Stock</span><span>15 (12.0%)</span></li>
              <li className="flex justify-between"><span>🔵 Overstock</span><span>23 (6.9%)</span></li>
            </ul>
            <div className="flex justify-between mt-4 text-sm font-semibold text-slate-200 border-t border-slate-700 pt-3">
              <span>Total Products</span>
              <span>1,248</span>
            </div>
          </div>

          <div className={cardClass}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-200">Inventory Age Analysis</h2>
              <select value={ageFilter} onChange={(e) => setAgeFilter(e.target.value)} className={selectClass}>
                <option>All Items</option>
                <option>Electronics</option>
                <option>Furniture</option>
              </select>
            </div>
            <div className="flex items-center justify-center h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={INVENTORY_AGE[ageFilter]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="range" tick={{ fontSize: 10, fill: "#475569" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#475569" }} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [v, "Items"]} />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={cardClass}>
            <h2 className="text-sm font-semibold text-slate-200 mb-4">Slow Moving Items (Top 5)</h2>
            <table className="w-full text-sm text-slate-400">
              <thead>
                <tr className="text-xs text-slate-500 border-b border-slate-700">
                  <th className="text-left pb-2">Product</th>
                  <th className="text-left pb-2">Days in Stock</th>
                  <th className="text-right pb-2">Inventory Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                <tr><td className="py-2 text-slate-200">Ergonomic Chair</td><td>145</td><td className="text-right">{formatCurrency(symbol, 1150)}</td></tr>
                <tr><td className="py-2 text-slate-200">Wireless Keyboard</td><td>132</td><td className="text-right">{formatCurrency(symbol, 680)}</td></tr>
                <tr><td className="py-2 text-slate-200">Bluetooth Speaker</td><td>120</td><td className="text-right">{formatCurrency(symbol, 450)}</td></tr>
                <tr><td className="py-2 text-slate-200">Desk Lamp</td><td>115</td><td className="text-right">{formatCurrency(symbol, 320)}</td></tr>
                <tr><td className="py-2 text-slate-200">Office Table</td><td>110</td><td className="text-right">{formatCurrency(symbol, 2100)}</td></tr>
              </tbody>
            </table>
            <button
              onClick={() => setShowSlowMoving(true)}
              className="text-xs text-indigo-400 mt-4 hover:underline"
            >
              View all slow moving items
            </button>
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div className={cardClass}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-200">Demand Forecast</h2>
              <select value={demandRange} onChange={(e) => setDemandRange(e.target.value)} className={selectClass}>
                <option>14 Days</option>
                <option>30 Days</option>
                <option>60 Days</option>
              </select>
            </div>
            <div className="flex items-center justify-center h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={DEMAND_FORECAST[demandRange]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#475569" }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10, fill: "#475569" }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="forecast" stroke="#6366f1" strokeWidth={2} dot={false} strokeDasharray="5 5" name="Forecast" />
                  <Line type="monotone" dataKey="actual"   stroke="#10b981" strokeWidth={2} dot={false} name="Actual" connectNulls={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={cardClass}>
            <h2 className="text-sm font-semibold text-slate-200 mb-4">💡 Insights & Recommendations</h2>
            <ul className="space-y-4 text-sm text-slate-400">
              <li className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-emerald-400">Reduce Overstock</p>
                  <p className="text-xs text-slate-500 mt-1">23 items are overstocked. Potential to reduce inventory value by {formatCurrency(symbol, 8240)}.</p>
                </div>
                <button onClick={() => setInsightModal(INSIGHTS[0])} className="text-xs text-indigo-400 hover:underline whitespace-nowrap">View details</button>
              </li>
              <li className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-amber-400">Reorder Soon</p>
                  <p className="text-xs text-slate-500 mt-1">18 items are likely to run out of stock in the next 7 days.</p>
                </div>
                <button onClick={() => setInsightModal(INSIGHTS[1])} className="text-xs text-indigo-400 hover:underline whitespace-nowrap">View details</button>
              </li>
              <li className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-indigo-400">High Demand</p>
                  <p className="text-xs text-slate-500 mt-1">Electronics category is trending up by 18.5% this week.</p>
                </div>
                <button onClick={() => setInsightModal(INSIGHTS[2])} className="text-xs text-indigo-400 hover:underline whitespace-nowrap">View details</button>
              </li>
            </ul>
            <button
              onClick={() => setShowAllInsights(true)}
              className="text-xs text-indigo-400 mt-4 hover:underline"
            >
              View all insights
            </button>
          </div>

        </div>

      </>}

    </main>
  );
}

export default Analytics;
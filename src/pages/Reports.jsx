// Reports.jsx
import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell,
} from "recharts";
import apiClient from "../api/client";

const cardClass  = "bg-slate-900 border border-slate-700/60 rounded-xl p-6 shadow-xl shadow-slate-950/20";
const tooltipStyle = { backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px", color: "#94a3b8" };
const PIE_COLORS = ["#6366f1", "#10b981", "#ef4444", "#f59e0b", "#8b5cf6"];

function Reports() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [reportsList, setReportsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [downloadingType, setDownloadingType] = useState(null);

  // Load production database records on component mount
  useEffect(() => {
    const fetchOperationalData = async () => {
      try {
        setLoading(true);
        const [prodRes, salesRes, reportsLogRes] = await Promise.all([
          apiClient.get("/products"),
          apiClient.get("/products/sales/all"),
          apiClient.get("/reports/log")
        ]);

        if (prodRes.data?.success) setProducts(prodRes.data.data || []);
        if (salesRes.data?.success) setSales(salesRes.data.data || []);
        if (reportsLogRes.data?.success) setReportsList(reportsLogRes.data.data || []);
      } catch (err) {
        console.error("Critical report data fetch fault:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOperationalData();
  }, []);

  // ─── DYNAMIC METRICS CALCULATION (NO MOCK DATA) ─────────────────────────
  const totalStockCount = products.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
  const inventoryTotalAssetValue = products.reduce((acc, curr) => acc + ((curr.quantity || 0) * (curr.price || 0)), 0);
  const totalGrossRevenueCleared = sales.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);

  const categoryMap = {};
  products.forEach(p => {
    const cat = p.category || "General Catalog";
    categoryMap[cat] = (categoryMap[cat] || 0) + (p.quantity || 0);
  });
  const liveCategoryPieData = Object.keys(categoryMap).map(key => ({ name: key, value: categoryMap[key] }));

  const historicalSalesTimeline = sales.slice(-7).reverse().map((s, idx) => ({
    label: s.unique_code || `TX-${idx + 1}`,
    revenue: s.total_amount || 0,
    units: s.quantity_sold || 1
  }));

  // ─── FULL BINARY STREAM PDF GENERATION DISPATCHER ────────────────────────
  const handlePdfGeneration = async (reportType) => {
    try {
      setDownloadingType(reportType);
      
      // Axios configuration using 'blob' response type for native file parsing
      const response = await apiClient.post(
        "/reports/generate",
        { type: reportType },
        { responseType: "blob" }
      );

      // Create browser-executable blob pointer
      const blob = new Blob([response.data], { type: "application/pdf" });
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", `${reportType.replace(/\s+/g, "_")}_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup browser cache allocations
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      // Re-fetch historical registry to instantly output the new item in log list
      const updatedLog = await apiClient.get("/reports/log");
      if (updatedLog.data?.success) setReportsList(updatedLog.data.data);

    } catch (error) {
      console.error("PDF generation execution fault:", error);
      alert("Failed to build printable PDF document stream. Ensure backend has 'pdfkit' configured.");
    } finally {
      setDownloadingType(null);
    }
  };

  const filteredReports = activeCategory ? reportsList.filter(r => r.type === activeCategory) : reportsList;

  if (loading) {
    return (
      <div className="flex-1 bg-slate-800 p-8 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-t-indigo-500 border-slate-700 rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 font-mono text-xs italic">Compiling live warehouse data streams...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 bg-slate-800 p-8 min-h-screen text-slate-100 font-sans selection:bg-indigo-500/30">
      
      {/* Upper Navigation Meta Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            System Auditing & Reports
          </h1>
          <p className="text-sm text-slate-400 mt-1">On-demand corporate data compilation and real-time PDF generation.</p>
        </div>
        <div className="text-xs font-mono bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg text-slate-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Database Synced
        </div>
      </div>

      {/* Numerical Performance Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className={`${cardClass} border-l-4 border-l-emerald-500`}>
          <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Gross Revenue Logged</p>
          <p className="text-2xl font-black text-emerald-400 mt-2 font-mono">
            ₦{totalGrossRevenueCleared.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className={`${cardClass} border-l-4 border-l-indigo-500`}>
          <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Current Catalog Units</p>
          <p className="text-2xl font-black text-indigo-400 mt-2 font-mono">
            {totalStockCount.toLocaleString()} <span className="text-xs font-normal text-slate-500">Units</span>
          </p>
        </div>
        <div className={`${cardClass} border-l-4 border-l-amber-500`}>
          <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Estimated Vault Valuation</p>
          <p className="text-2xl font-black text-amber-500 mt-2 font-mono">
            ₦{inventoryTotalAssetValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Main Analysis Visual Split Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Charts & Interactive Generation Cards */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`${cardClass} h-64`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">Recent Sales Trend Flow</h3>
            {historicalSalesTimeline.length > 0 ? (
              <ResponsiveContainer width="100%" height="80%">
                <LineChart data={historicalSalesTimeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} name="Revenue (₦)" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-500 italic py-12 text-center">No transaction variables recorded yet.</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={cardClass}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Inventory Categorized Split</h3>
              {liveCategoryPieData.length > 0 ? (
                <div className="h-40 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={liveCategoryPieData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" paddingAngle={4}>
                        {liveCategoryPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic text-center py-12">No inventory categories assigned.</p>
              )}
            </div>

            {/* Live Interactive Actions Execution Engine Container */}
            <div className={cardClass}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-3">⚡ On-Demand PDF Compilation Engine</h3>
              <div className="space-y-2.5">
                <button
                  disabled={downloadingType !== null}
                  onClick={() => handlePdfGeneration("Inventory Reports")}
                  className="w-full flex items-center justify-between p-3 text-left text-xs bg-slate-950/40 border border-slate-800 rounded-xl hover:border-indigo-500/80 hover:bg-indigo-950/20 text-slate-200 transition-all group font-medium"
                >
                  <span className="flex items-center gap-2.5">
                    <span>📊</span> Compile Master Inventory PDF Report
                  </span>
                  <span className="text-slate-500 group-hover:text-indigo-400 font-mono transition-colors">
                    {downloadingType === "Inventory Reports" ? "Compiling..." : "Run →"}
                  </span>
                </button>
                <button
                  disabled={downloadingType !== null}
                  onClick={() => handlePdfGeneration("Transaction Reports")}
                  className="w-full flex items-center justify-between p-3 text-left text-xs bg-slate-950/40 border border-slate-800 rounded-xl hover:border-emerald-500/80 hover:bg-emerald-950/20 text-slate-200 transition-all group font-medium"
                >
                  <span className="flex items-center gap-2.5">
                    <span>🔄</span> Compile Checkout Transactions Audit Ledger
                  </span>
                  <span className="text-slate-500 group-hover:text-emerald-400 font-mono transition-colors">
                    {downloadingType === "Transaction Reports" ? "Compiling..." : "Run →"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Categories Filtering Control Column */}
        <div className="space-y-6">
          <div className={cardClass}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Report Categories Filter</h3>
              {activeCategory && (
                <button onClick={() => setActiveCategory(null)} className="text-[10px] text-indigo-400 hover:underline">
                  Reset Filter
                </button>
              )}
            </div>
            <ul className="space-y-2 text-xs">
              {["Inventory Reports", "Transaction Reports"].map(catName => (
                <li
                  key={catName}
                  onClick={() => setActiveCategory(catName)}
                  className={`flex justify-between items-center p-3 rounded-xl cursor-pointer border transition-all ${
                    activeCategory === catName
                      ? "bg-indigo-950/40 border-indigo-500 text-indigo-300 font-semibold shadow-lg shadow-indigo-950/20"
                      : "bg-slate-950/20 border-slate-800 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>📋</span> {catName}
                  </span>
                  <span className="font-mono text-[10px] bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-slate-300 font-bold">
                    {reportsList.filter(r => r.type === catName).length}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Historical Logs Pipeline View Table Card Container */}
      <div className={cardClass}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Historical Export Lifecycle Log</h3>
          <span className="text-[10px] font-mono bg-slate-950 px-2 py-1 rounded text-slate-500">
            Showing {filteredReports.length} Document Streams
          </span>
        </div>
        
        <div className="overflow-x-auto rounded-xl border border-slate-800/80">
          <table className="w-full text-xs text-left text-slate-400">
            <thead className="bg-slate-950/60 text-slate-500 font-mono tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-4">Reference ID</th>
                <th className="p-4">Document Profile Title</th>
                <th className="p-4">Category Type</th>
                <th className="p-4">Generated At</th>
                <th className="p-4 text-center">Format</th>
                <th className="p-4 text-right">Channel Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-800/20 group transition-colors">
                    <td className="p-4 font-bold text-slate-400 group-hover:text-indigo-400 transition-colors">{report.id}</td>
                    <td className="p-4 text-slate-200 font-sans font-medium">{report.name}</td>
                    <td className="p-4 text-[11px] font-sans text-slate-400">{report.type}</td>
                    <td className="p-4 text-[11px] text-slate-500">{report.date}</td>
                    <td className="p-4 text-center">
                      <span className="px-2 py-0.5 bg-slate-950 rounded border border-slate-700 text-[10px] text-red-400 font-bold">
                        {report.format}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-[10px] text-emerald-400 font-sans font-medium px-2 py-0.5 bg-emerald-950/40 border border-emerald-900/40 rounded-full">
                        ✓ {report.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500 italic font-sans">
                    No matching report logs found. Run a compilation above to instantiate a track.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

export default Reports;
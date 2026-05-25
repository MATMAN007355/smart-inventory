import { useState, useMemo, useEffect } from "react";
import { useSettings } from "./settings";
import apiClient from "../api/client";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const TYPE_ICON = {
  "Stock In":  { icon: "⬇️", color: "text-emerald-400" },
  "Stock Out": { icon: "⬆️", color: "text-red-400"     },
  "Transfer":  { icon: "🔄", color: "text-indigo-400"  },
};

// ── SORT HELPERS ──────────────────────────────────────────────────────────────
const COLUMNS = [
  { key: "dateObj",     label: "Date & Time"  },
  { key: "type",        label: "Type"         },
  { key: "product",     label: "Product"      },
  { key: "location",    label: "Category"     },
  { key: "quantity",    label: "Qty Sold"     },
  { key: "unitCost",    label: "Unit Cost"    },
  { key: "totalValue",  label: "Total Amount" },
  { key: "performer",   label: "Sold By"      },
];

function getSortValue(t, key) {
  if (key === "quantity")   return parseFloat(t.quantity);
  if (key === "unitCost")   return t.unitCost;
  if (key === "totalValue") return t.totalValue;
  if (key === "dateObj")    return t.dateObj.getTime();
  return (t[key] ?? "").toString().toLowerCase();
}

// ── Currency & date helpers ───────────────────────────────────────────────────
function getCurrencySymbol(currency) {
  if (currency.includes("EUR")) return "€";
  if (currency.includes("GBP")) return "£";
  return "₦";
}

function formatCurrency(symbol, value) {
  const abs = Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${symbol}${abs}`;
}

function formatDate(dateObj, format) {
  const d   = dateObj.getDate().toString().padStart(2, "0");
  const m   = (dateObj.getMonth() + 1).toString().padStart(2, "0");
  const y   = dateObj.getFullYear();
  const mon = dateObj.toLocaleString("en-US", { month: "short" });
  const day = dateObj.toLocaleString("en-US", { day: "numeric" });
  if (format === "DD/MM/YYYY") return `${d}/${m}/${y}`;
  if (format === "YYYY-MM-DD") return `${y}-${m}-${d}`;
  return `${mon} ${day}, ${y}`;
}

// ── Map API sale record to table row shape ────────────────────────────────────
function mapSaleToRow(sale) {
  const dateObj = new Date(sale.createdAt);
  return {
    dateObj,
    date: dateObj.toLocaleDateString(),
    time: dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    type: "Stock Out",
    product: sale.product_name,
    sku: sale.unique_code,
    reference: sale._id,
    location: sale.product?.category || "—",
    locationTo: null,
    quantity: String(Math.abs(parseFloat(sale.quantity_sold) || 0)),
    unitCost: sale.price,
    totalValue: Math.abs(sale.total_amount),
    totalNeg: true,
    performer: `${sale.sold_by?.first_name ?? ""} ${sale.sold_by?.last_name ?? ""}`.trim(),
    email: sale.sold_by?.email || "—",
  };
}

// ── MODAL ─────────────────────────────────────────────────────────────────────
function TransactionModal({ transaction: t, onClose, symbol, dateFormat }) {
  if (!t) return null;
  const { icon, color } = TYPE_ICON[t.type];
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-slate-100">Transaction Details</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-xl leading-none"
          >✕</button>
        </div>

        {/* Reference + Type */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-bold text-indigo-400">{t.reference}</span>
          <span className={`${color} font-medium text-sm`}>{icon} {t.type}</span>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div>
            <p className="text-xs text-slate-500 mb-1">Date & Time</p>
            <p className="text-slate-200 font-medium">{formatDate(t.dateObj, dateFormat)}</p>
            <p className="text-xs text-slate-500">{t.time}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Product</p>
            <p className="text-slate-200 font-medium">{t.product}</p>
            <p className="text-xs text-slate-500">{t.sku}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Category</p>
            <p className="text-slate-200 font-medium">{t.location}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Qty Sold</p>
            <p className="font-semibold text-emerald-400">{t.quantity}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Unit Cost</p>
            <p className="text-slate-200 font-medium">{formatCurrency(symbol, t.unitCost)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Total Amount</p>
            <p className="font-semibold text-emerald-400">
              {formatCurrency(symbol, t.totalValue)}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-slate-500 mb-1">Sold By</p>
            <p className="text-slate-200 font-medium">{t.performer}</p>
            <p className="text-xs text-slate-500">{t.email}</p>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-6 w-full py-2 rounded-xl border border-slate-600 text-sm text-slate-300 hover:bg-slate-700"
        >Close</button>
      </div>
    </div>
  );
}

// ── COMPONENT ─────────────────────────────────────────────────────────────────
function Transaction() {

  const { currency, dateFormat, warehouse } = useSettings();
  const symbol      = getCurrencySymbol(currency);
  const rowsPerPage = 10; // fixed at 10 rows per page

  const [salesData,      setSalesData]      = useState([]);
  const [typeFilter,     setTypeFilter]     = useState("All Types");
  const [productFilter,  setProductFilter]  = useState("All Products");
  const [locationFilter, setLocationFilter] = useState("All Categories");
  const [dateFilter,     setDateFilter]     = useState("All");
  const [currentPage,    setCurrentPage]    = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [sortKey, setSortKey] = useState("dateObj");
  const [sortDir, setSortDir] = useState("desc");

  // ── API call ────────────────────────────────────────────────────────────────
  useEffect(() => {
    apiClient.get("/products/sales/all")
      .then((res) => {
        console.log("Sales data:", res.data);
        const rows = (res.data?.data ?? res.data ?? []).map(mapSaleToRow);
        setSalesData(rows);
      })
      .catch((err) => console.error("Failed to fetch sales:", err));
  }, []);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setCurrentPage(1);
  };

  const updateFilter = (setter) => (e) => { setter(e.target.value); setCurrentPage(1); };

  const handleExport = () => {
    const header = ["Date", "Time", "Type", "Product", "SKU", "Category", "Qty Sold", "Unit Cost", "Total Amount", "Sold By"];
    const rows = filtered.map((t) => [
      formatDate(t.dateObj, dateFormat),
      t.time,
      t.type,
      `"${t.product}"`,
      t.sku,
      t.location,
      t.quantity,
      formatCurrency(symbol, t.unitCost),
      formatCurrency(symbol, t.totalValue),
      `"${t.performer}"`,
    ]);
    const csv  = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "transactions-export.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  // Derive unique product names and categories from live data for filter dropdowns
  const uniqueProducts   = [...new Set(salesData.map((t) => t.product))];
  const uniqueCategories = [...new Set(salesData.map((t) => t.location))];

  const filtered = useMemo(() => {
    const result = salesData.filter((t) => {
      if (typeFilter !== "All Types" && t.type !== typeFilter) return false;
      if (productFilter !== "All Products" && t.product !== productFilter) return false;
      if (locationFilter !== "All Categories" && t.location !== locationFilter) return false;
      if (dateFilter === "Last 30 Days") {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 30);
        if (t.dateObj < cutoff) return false;
      }
      if (dateFilter === "Last 7 Days") {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 7);
        if (t.dateObj < cutoff) return false;
      }
      return true;
    });

    result.sort((a, b) => {
      const aVal = getSortValue(a, sortKey);
      const bVal = getSortValue(b, sortKey);
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [salesData, typeFilter, productFilter, locationFilter, dateFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const safePage   = Math.min(currentPage, totalPages);
  const pageStart  = (safePage - 1) * rowsPerPage;
  const paginated  = filtered.slice(pageStart, pageStart + rowsPerPage);

  // shared select style
  const selectClass = "text-sm border border-slate-600 rounded-xl px-3 py-2 bg-slate-900 text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <main className="flex-1 min-h-screen bg-slate-800 p-8">

      {/* Modal */}
      <TransactionModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        symbol={symbol}
        dateFormat={dateFormat}
      />

      {/* Top Section */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Inventory Transactions</h1>
          <p className="text-sm text-slate-400 mt-1">Track all inventory activities and movements</p>
        </div>
        <select
          className={selectClass}
          value={dateFilter}
          onChange={updateFilter(setDateFilter)}
        >
          <option value="All">All Time</option>
          <option value="Last 7 Days">Last 7 Days</option>
          <option value="Last 30 Days">Last 30 Days</option>
        </select>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 p-5 rounded-xl border border-slate-700 mb-6">
        <div className="flex items-center gap-4 flex-wrap">

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">Transaction Type</label>
            <select className={selectClass} value={typeFilter} onChange={updateFilter(setTypeFilter)}>
              <option>All Types</option>
              <option>Stock Out</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">Product</label>
            <select className={selectClass} value={productFilter} onChange={updateFilter(setProductFilter)}>
              <option>All Products</option>
              {uniqueProducts.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">Category</label>
            <select className={selectClass} value={locationFilter} onChange={updateFilter(setLocationFilter)}>
              <option>All Categories</option>
              {uniqueCategories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">Date Range</label>
            <select className={selectClass} value={dateFilter} onChange={updateFilter(setDateFilter)}>
              <option value="All">All Time</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
            </select>
          </div>

          <div className="mt-4 ml-auto flex items-center gap-2">
            <button
              onClick={() => {
                setTypeFilter("All Types");
                setProductFilter("All Products");
                setLocationFilter("All Categories");
                setDateFilter("All");
                setCurrentPage(1);
              }}
              className="flex items-center gap-2 px-4 py-2 border border-slate-600 rounded-xl bg-slate-800 text-sm text-slate-300 hover:bg-slate-700"
            >
              ✕ Clear Filters
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 border border-slate-600 rounded-xl bg-slate-800 text-sm text-slate-300 hover:bg-slate-700"
            >
              ⬇️ Export
            </button>
          </div>

        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-x-auto">

        <div className="px-6 py-4 border-b border-slate-700">
          <h2 className="text-sm font-semibold text-slate-200">Transaction History</h2>
        </div>

        <table className="w-full text-sm text-slate-400">

          <thead className="text-xs text-slate-500 border-b border-slate-700">
            <tr>
              {COLUMNS.map(({ key, label }) => (
                <th
                  key={key}
                  className="px-6 py-4 text-left cursor-pointer select-none hover:text-slate-300"
                  onClick={() => handleSort(key)}
                >
                  {label}{" "}
                  {sortKey === key ? (sortDir === "asc" ? "↑" : "↓") : <span className="opacity-30">↕</span>}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800">

            {salesData.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-slate-500">
                  Loading transactions...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-slate-500">
                  No transactions match the selected filters.
                </td>
              </tr>
            ) : (
              paginated.map((t, i) => {
                const { icon, color } = TYPE_ICON[t.type];
                return (
                  <tr key={i} className="hover:bg-slate-800">
                    <td className="px-6 py-4">
                      <p className="text-slate-200">{formatDate(t.dateObj, dateFormat)}</p>
                      <p className="text-xs text-slate-500">{t.time}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`${color} font-medium`}>{icon} {t.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-200">{t.product}</p>
                      <p className="text-xs text-slate-500">{t.sku}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-200 capitalize">{t.location}</p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-emerald-400">
                      {t.quantity}
                    </td>
                    <td className="px-6 py-4 text-slate-200">{formatCurrency(symbol, t.unitCost)}</td>
                    <td className="px-6 py-4 font-semibold text-emerald-400">
                      {formatCurrency(symbol, t.totalValue)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-200">{t.performer}</p>
                      <p className="text-xs text-slate-500">{t.email}</p>
                    </td>
                  </tr>
                );
              })
            )}

          </tbody>

        </table>
      </div>

      {/* Pagination — matches Products.jsx style */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '20px', gap: '12px' }}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
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
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
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

export default Transaction;
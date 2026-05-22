import { useState, useMemo } from "react";
import { useSettings } from "./settings";

// ── DATA ──────────────────────────────────────────────────────────────────────
const ALL_TRANSACTIONS = [
  {
    date: "May 18, 2024", time: "10:30 AM", dateObj: new Date("2024-05-18"),
    type: "Stock In", product: "Wireless Earbuds", sku: "WE-1001",
    reference: "PO #1051", location: "Main Warehouse", locationTo: null,
    quantity: "+50", unitCost: 25.00, totalValue: 1250.00, totalNeg: false,
    performer: "John Admin", email: "admin@company.com",
  },
  {
    date: "May 18, 2024", time: "09:15 AM", dateObj: new Date("2024-05-18"),
    type: "Stock Out", product: "Premium Coffee Beans", sku: "CF-2002",
    reference: "SO #2056", location: "Main Warehouse", locationTo: null,
    quantity: "-20", unitCost: 15.00, totalValue: -300.00, totalNeg: true,
    performer: "John Admin", email: "admin@company.com",
  },
  {
    date: "May 17, 2024", time: "04:45 PM", dateObj: new Date("2024-05-17"),
    type: "Transfer", product: "Printer Ink Cartridge", sku: "IC-4004",
    reference: "TR #3003", location: "Main Warehouse", locationTo: "Warehouse B",
    quantity: "-5", unitCost: 45.00, totalValue: -225.00, totalNeg: true,
    performer: "John Admin", email: "admin@company.com",
  },
  {
    date: "May 17, 2024", time: "02:20 PM", dateObj: new Date("2024-05-17"),
    type: "Stock In", product: "Ergonomic Chair", sku: "CH-3003",
    reference: "PO #1050", location: "Main Warehouse", locationTo: null,
    quantity: "+10", unitCost: 85.00, totalValue: 850.00, totalNeg: false,
    performer: "Sarah Manager", email: "sarah@company.com",
  },
  {
    date: "May 16, 2024", time: "11:00 AM", dateObj: new Date("2024-05-16"),
    type: "Stock Out", product: "Stainless Steel Bottle", sku: "SB-5005",
    reference: "SO #2055", location: "Main Warehouse", locationTo: null,
    quantity: "-15", unitCost: 12.00, totalValue: -180.00, totalNeg: true,
    performer: "John Admin", email: "admin@company.com",
  },
  {
    date: "May 15, 2024", time: "03:30 PM", dateObj: new Date("2024-05-15"),
    type: "Stock In", product: "Premium Coffee Beans", sku: "CF-2002",
    reference: "PO #1049", location: "Main Warehouse", locationTo: null,
    quantity: "+30", unitCost: 15.00, totalValue: 450.00, totalNeg: false,
    performer: "Mike Staff", email: "mike@company.com",
  },
];

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
  { key: "reference",   label: "Reference"    },
  { key: "location",    label: "Location"     },
  { key: "quantity",    label: "Quantity"     },
  { key: "unitCost",    label: "Unit Cost"    },
  { key: "totalValue",  label: "Total Value"  },
  { key: "performer",   label: "Performed By" },
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
  return "$";
}

function formatCurrency(symbol, value) {
  const abs = Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return value < 0 ? `-${symbol}${abs}` : `${symbol}${abs}`;
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
            <p className="text-xs text-slate-500 mb-1">Location</p>
            <p className="text-slate-200 font-medium">{t.location}</p>
            {t.locationTo && <p className="text-xs text-slate-500">→ {t.locationTo}</p>}
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Quantity</p>
            <p className={`font-semibold ${t.quantity.startsWith("+") ? "text-emerald-400" : "text-red-400"}`}>
              {t.quantity}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Unit Cost</p>
            <p className="text-slate-200 font-medium">{formatCurrency(symbol, t.unitCost)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Total Value</p>
            <p className={`font-semibold ${t.totalNeg ? "text-red-400" : "text-emerald-400"}`}>
              {formatCurrency(symbol, t.totalValue)}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-slate-500 mb-1">Performed By</p>
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

  const { currency, dateFormat, itemsPerPage, warehouse } = useSettings();
  const symbol      = getCurrencySymbol(currency);
  const rowsPerPage = parseInt(itemsPerPage) || 6;

  const [typeFilter,     setTypeFilter]     = useState("All Types");
  const [productFilter,  setProductFilter]  = useState("All Products");
  const [locationFilter, setLocationFilter] = useState("All Locations");
  const [dateFilter,     setDateFilter]     = useState("May 12 – May 18, 2024");
  const [currentPage,    setCurrentPage]    = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [sortKey, setSortKey] = useState("dateObj");
  const [sortDir, setSortDir] = useState("desc");

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
    const header = ["Date", "Time", "Type", "Product", "SKU", "Reference", "Location", "Quantity", "Unit Cost", "Total Value", "Performed By"];
    const rows = filtered.map((t) => [
      formatDate(t.dateObj, dateFormat),
      t.time,
      t.type,
      `"${t.product}"`,
      t.sku,
      t.reference,
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

  const filtered = useMemo(() => {
    const result = ALL_TRANSACTIONS.filter((t) => {
      if (typeFilter !== "All Types" && t.type !== typeFilter) return false;
      if (productFilter !== "All Products" && t.product !== productFilter) return false;
      if (locationFilter !== "All Locations" &&
          t.location !== locationFilter && t.locationTo !== locationFilter) return false;
      if (dateFilter === "Last 30 Days") {
        const cutoff = new Date("2024-05-18");
        cutoff.setDate(cutoff.getDate() - 30);
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
  }, [typeFilter, productFilter, locationFilter, dateFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const safePage   = Math.min(currentPage, totalPages);
  const pageStart  = (safePage - 1) * rowsPerPage;
  const paginated  = filtered.slice(pageStart, pageStart + rowsPerPage);

  // shared select style
  const selectClass = "text-sm border border-slate-600 rounded-xl px-3 py-2 bg-slate-900 text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <main className="flex-1 bg-slate-800 p-8">

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
          <option>May 12 – May 18, 2024</option>
          <option>Last 30 Days</option>
        </select>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 p-5 rounded-xl border border-slate-700 mb-6">
        <div className="flex items-center gap-4 flex-wrap">

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">Transaction Type</label>
            <select className={selectClass} value={typeFilter} onChange={updateFilter(setTypeFilter)}>
              <option>All Types</option>
              <option>Stock In</option>
              <option>Stock Out</option>
              <option>Transfer</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">Product</label>
            <select className={selectClass} value={productFilter} onChange={updateFilter(setProductFilter)}>
              <option>All Products</option>
              <option>Wireless Earbuds</option>
              <option>Premium Coffee Beans</option>
              <option>Ergonomic Chair</option>
              <option>Printer Ink Cartridge</option>
              <option>Stainless Steel Bottle</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">Location</label>
            <select className={selectClass} value={locationFilter} onChange={updateFilter(setLocationFilter)}>
              <option>All Locations</option>
              <option>Main Warehouse</option>
              <option>Warehouse B</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">Date Range</label>
            <select className={selectClass} value={dateFilter} onChange={updateFilter(setDateFilter)}>
              <option>May 12 – May 18, 2024</option>
              <option>Last 30 Days</option>
            </select>
          </div>

          <div className="mt-4 ml-auto flex items-center gap-2">
            <button
              onClick={() => {
                setTypeFilter("All Types");
                setProductFilter("All Products");
                setLocationFilter("All Locations");
                setDateFilter("May 12 – May 18, 2024");
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

            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-10 text-center text-slate-500">
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
                      <button
                        onClick={() => setSelectedTransaction(t)}
                        className="text-indigo-400 hover:underline"
                      >{t.reference}</button>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-200">{t.location}</p>
                      {t.locationTo && <p className="text-xs text-slate-500">→ {t.locationTo}</p>}
                    </td>
                    <td className={`px-6 py-4 font-semibold ${t.quantity.startsWith("+") ? "text-emerald-400" : "text-red-400"}`}>
                      {t.quantity}
                    </td>
                    <td className="px-6 py-4 text-slate-200">{formatCurrency(symbol, t.unitCost)}</td>
                    <td className={`px-6 py-4 font-semibold ${t.totalNeg ? "text-red-400" : "text-emerald-400"}`}>
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

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6 text-sm text-slate-500">
        <p>
          Showing {filtered.length === 0 ? 0 : pageStart + 1} to{" "}
          {Math.min(pageStart + rowsPerPage, filtered.length)} of {filtered.length} transactions
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="px-3 py-1 rounded-lg border border-slate-600 bg-slate-900 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >Previous</button>
          {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded-lg ${
                safePage === page
                  ? "bg-indigo-600 text-white"
                  : "border border-slate-600 bg-slate-900 text-slate-300 hover:bg-slate-700"
              }`}
            >{page}</button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="px-3 py-1 rounded-lg border border-slate-600 bg-slate-900 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >Next</button>
        </div>
      </div>

    </main>
  );
}

export default Transaction;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useInventory } from "./InventoryContext"; // ← shared context
import { useSalesData } from "./useSalesData";     // ← new: live sales feed

const lineData7Days = [
  { day: "May 12", value: 180000 },
  { day: "May 13", value: 195000 },
  { day: "May 14", value: 188000 },
  { day: "May 15", value: 210000 },
  { day: "May 16", value: 205000 },
  { day: "May 17", value: 230000 },
  { day: "May 18", value: 245680 },
];

const lineData30Days = [
  { day: "Apr 18", value: 150000 },
  { day: "Apr 23", value: 162000 },
  { day: "Apr 28", value: 158000 },
  { day: "May 3",  value: 175000 },
  { day: "May 8",  value: 190000 },
  { day: "May 13", value: 210000 },
  { day: "May 18", value: 245680 },
];

function formatTimeAgo(index) {
  if (index === 0) return "Just now";
  if (index === 1) return "1m ago";
  if (index < 5) return `${index * 3}m ago`;
  return `${index}h ago`;
}

// ── tiny currency helper (mirrors Transaction.jsx) ────────────────────────────
function fmtCurrency(value) {
  return "₦" + Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function Dashboard() {
  const [chartRange, setChartRange] = useState("7 Days");
  const [search, setSearch] = useState("");
  const [reorderItem, setReorderItem] = useState(null);
  const [reorderQty, setReorderQty] = useState(10);
  const [reorderSuccess, setReorderSuccess] = useState(false);

  // Modals and Loaders
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [showCreatePO, setShowCreatePO] = useState(false);
  const [createPOSuccess, setCreatePOSuccess] = useState(false);

  const [newProduct, setNewProduct] = useState({
    product_name: "",
    sku: "",
    quantity: "",
    category: "",
    price: "",
  });
  const [newPO, setNewPO] = useState({ supplier: "", product: "", qty: "", notes: "" });
  const navigate = useNavigate();

  // ─── Real-time data from shared context ───────────────────────────────────
  const {
    totalInventoryValue,
    totalProducts,
    lowStockItems,
    outOfStockItems,
    donutData,
    stockMovements,
    addProduct,
  } = useInventory();

  // ─── Live sales data (mirrors Transaction.jsx) ────────────────────────────
  const { salesData, loading: salesLoading } = useSalesData();

  const lineData = chartRange === "7 Days" ? lineData7Days : lineData30Days;

  const filteredLowStock = lowStockItems.filter(
    (item) =>
      item.product_name?.toLowerCase().includes(search.toLowerCase()) ||
      item.unique_code?.toLowerCase().includes(search.toLowerCase())
  );

  const handleReorderConfirm = () => {
    setReorderSuccess(true);
    setTimeout(() => {
      setReorderSuccess(false);
      setReorderItem(null);
      setReorderQty(10);
      toast.success("Stock reorder request sent successfully!");
    }, 2000);
  };

  // Uses shared context addProduct so Products page stays in sync too
  const handleAddProductConfirm = async (e) => {
    if (e) e.preventDefault();
    setIsAddingProduct(true);

    const payload = {
      product_name: newProduct.product_name,
      sku: newProduct.sku || undefined,
      quantity: Number(newProduct.quantity),
      category: newProduct.category.toLowerCase(),
      price: Number(newProduct.price),
    };

    try {
      await addProduct(payload);
      toast.success(`Successfully added "${payload.product_name}" to database!`);
      setShowAddProduct(false);
      setNewProduct({ product_name: "", sku: "", quantity: "", category: "", price: "" });
    } catch (error) {
      console.error("Failed to add product:", error);
      const errorMsg = error.response?.data?.message || "Could not save product. Please try again.";
      toast.error(errorMsg);
    } finally {
      setIsAddingProduct(false);
    }
  };

  const handleCreatePOConfirm = () => {
    setCreatePOSuccess(true);
    setTimeout(() => {
      setCreatePOSuccess(false);
      setShowCreatePO(false);
      setNewPO({ supplier: "", product: "", qty: "", notes: "" });
      toast.info("Purchase order generated cleanly.");
    }, 2000);
  };

  const inputClass =
    "w-full px-4 py-2 border border-slate-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-700 text-slate-100 placeholder-slate-400 disabled:opacity-50";

  // Total stock movements count derived from real movements list
  const totalMovements = stockMovements.length;

  // ── Donut legend percentages from live data ──────────────────────────────
  const donutTotal = donutData.reduce((s, d) => s + d.value, 0) || 1;

  return (
    <main className="flex-1 bg-slate-800 p-8 relative min-h-screen">

      {/* Reorder Modal */}
      {reorderItem && (
        <div className="fixed inset-0 bg-slate-950 bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl p-8 w-full max-w-md">
            {reorderSuccess ? (
              <div className="flex flex-col items-center justify-center gap-3 py-6">
                <span className="text-4xl">✅</span>
                <p className="text-slate-100 font-semibold text-lg">Reorder Placed!</p>
                <p className="text-slate-400 text-sm">Your order for {reorderItem.product_name} has been submitted.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-slate-100">Reorder Product</h2>
                  <button onClick={() => setReorderItem(null)} className="text-slate-400 hover:text-slate-200 text-xl">✕</button>
                </div>
                <div className="bg-slate-700 p-4 rounded-xl mb-6">
                  <p className="text-sm font-medium text-slate-100">{reorderItem.product_name}</p>
                  <p className="text-xs text-slate-400 mt-1">SKU: {reorderItem.unique_code}</p>
                  <p className="text-xs text-red-400 mt-1">Current Stock: {reorderItem.quantity}</p>
                </div>
                <div className="mb-6">
                  <label className="text-xs text-slate-400 mb-1 block">Reorder Quantity</label>
                  <input
                    type="number"
                    min={1}
                    value={reorderQty}
                    onChange={(e) => setReorderQty(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setReorderItem(null)} className="flex-1 px-4 py-2 border border-slate-600 rounded-xl text-sm text-slate-300 hover:bg-slate-700">Cancel</button>
                  <button onClick={handleReorderConfirm} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-500">Confirm Reorder</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-slate-950/80 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => !isAddingProduct && setShowAddProduct(false)} />
          <div className="relative w-full max-w-md p-6 overflow-hidden rounded-2xl bg-[#0F172B] border border-slate-800 shadow-2xl z-10">
            <form onSubmit={handleAddProductConfirm}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-100">Add Product</h2>
                <button type="button" disabled={isAddingProduct} onClick={() => setShowAddProduct(false)} className="p-1 text-xl text-slate-400 transition-colors rounded-lg hover:text-slate-200 disabled:opacity-30">✕</button>
              </div>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block mb-1 text-xs font-medium text-slate-400">Product Name</label>
                  <input type="text" required disabled={isAddingProduct} placeholder="e.g. Big Bull Rice" value={newProduct.product_name} onChange={(e) => setNewProduct({ ...newProduct, product_name: e.target.value })} className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-xs font-medium text-slate-400">Quantity</label>
                    <input type="number" required disabled={isAddingProduct} min={0} placeholder="20" value={newProduct.quantity} onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className="block mb-1 text-xs font-medium text-slate-400">Price</label>
                    <input type="number" required disabled={isAddingProduct} min={0} placeholder="50000" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium text-slate-400">Category</label>
                  <select required disabled={isAddingProduct} value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} className={inputClass}>
                    <option value="">Select category</option>
                    <option value="Food">Food / Groceries</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Office Supplies">Office Supplies</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button type="button" disabled={isAddingProduct} onClick={() => setShowAddProduct(false)} className="flex-1 px-4 py-2.5 text-sm font-medium border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={isAddingProduct} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20 disabled:bg-indigo-800 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {isAddingProduct ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Saving...
                    </>
                  ) : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create PO Modal */}
      {showCreatePO && (
        <div className="fixed inset-0 bg-slate-950 bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl p-8 w-full max-w-md">
            {createPOSuccess ? (
              <div className="flex flex-col items-center justify-center gap-3 py-6">
                <span className="text-4xl">✅</span>
                <p className="text-slate-100 font-semibold text-lg">Purchase Order Created!</p>
                <p className="text-slate-400 text-sm">Your purchase order has been submitted.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-slate-100">Create Purchase Order</h2>
                  <button onClick={() => setShowCreatePO(false)} className="text-slate-400 hover:text-slate-200 text-xl">✕</button>
                </div>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Supplier</label>
                    <input type="text" placeholder="e.g. Fresh Supplies Co." value={newPO.supplier} onChange={(e) => setNewPO({ ...newPO, supplier: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Product</label>
                    <input type="text" placeholder="e.g. Wireless Earbuds" value={newPO.product} onChange={(e) => setNewPO({ ...newPO, product: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Quantity</label>
                    <input type="number" min={1} placeholder="e.g. 100" value={newPO.qty} onChange={(e) => setNewPO({ ...newPO, qty: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Notes</label>
                    <textarea placeholder="Any additional notes..." value={newPO.notes} onChange={(e) => setNewPO({ ...newPO, notes: e.target.value })} className={`${inputClass} resize-none h-20`} />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setShowCreatePO(false)} className="flex-1 px-4 py-2 border border-slate-600 rounded-xl text-sm text-slate-300 hover:bg-slate-700">Cancel</button>
                  <button onClick={handleCreatePOConfirm} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-500">Create PO</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Top Section */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Overview of your inventory performance</p>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search products, SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-slate-600 rounded-xl bg-slate-900 text-slate-200 placeholder-slate-500 outline-none focus:ring-2 focus:ring-indigo-500 w-56"
            />
          </div>
          <select className="text-sm border border-slate-600 rounded-xl px-3 py-2 bg-slate-900 text-slate-300 outline-none">
            <option>May 12 – May 18, 2026</option>
            <option>Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Stats Cards — all live from context */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-700">
          <p className="text-xs text-slate-400 mb-1">Total Inventory Value</p>
          <p className="text-2xl font-bold text-slate-100">
            ${totalInventoryValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-emerald-400 mt-1">Live from products</p>
        </div>
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-700">
          <p className="text-xs text-slate-400 mb-1">Total Products</p>
          <p className="text-2xl font-bold text-slate-100">{totalProducts.toLocaleString()}</p>
          <p className="text-xs text-emerald-400 mt-1">Live from products</p>
        </div>
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-700">
          <p className="text-xs text-slate-400 mb-1">Low Stock Items</p>
          <p className="text-2xl font-bold text-slate-100">{lowStockItems.length}</p>
          <p className="text-xs text-red-400 mt-1">≤ 10 units remaining</p>
        </div>
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-700">
          <p className="text-xs text-slate-400 mb-1">Stock Movements</p>
          <p className="text-2xl font-bold text-slate-100">{totalMovements}</p>
          <p className="text-xs text-emerald-400 mt-1">This session</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Line Chart */}
        <div className="lg:col-span-1 bg-slate-900 p-6 rounded-xl border border-slate-700 h-72">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-200">Inventory Value Over Time</h2>
            <select
              className="text-xs border border-slate-600 rounded-lg px-2 py-1 outline-none text-slate-300 bg-slate-800"
              value={chartRange}
              onChange={(e) => setChartRange(e.target.value)}
            >
              <option>7 Days</option>
              <option>30 Days</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#475569" }} />
              <YAxis tick={{ fontSize: 10, fill: "#475569" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px" }}
                labelStyle={{ color: "#94a3b8" }}
                itemStyle={{ color: "#818cf8" }}
                formatter={(value) => [`$${value.toLocaleString()}`, "Value"]}
              />
              <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={{ r: 3, fill: "#818cf8" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Donut Chart — live data */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 h-72">
          <h2 className="text-sm font-semibold text-slate-200 mb-2">Stock Status Overview</h2>
          <div className="flex items-center gap-2">
            <PieChart width={130} height={130}>
              <Pie data={donutData} cx={60} cy={60} innerRadius={35} outerRadius={60} dataKey="value">
                {donutData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
            <ul className="space-y-2 text-xs text-slate-400">
              {donutData.map((d) => (
                <li key={d.name} className="flex justify-between gap-4">
                  <span style={{ color: d.color }}>■ {d.name}</span>
                  <span>{d.value} ({donutTotal > 0 ? ((d.value / donutTotal) * 100).toFixed(1) : 0}%)</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex justify-between mt-2 text-sm font-semibold text-slate-200 border-t border-slate-700 pt-3">
            <span>Total</span>
            <span>{donutTotal}</span>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 h-72">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-200">Recent Alerts</h2>
            <button onClick={() => navigate("/alerts")} className="text-xs text-indigo-400 hover:underline">View all</button>
          </div>
          <ul className="space-y-4 text-sm text-slate-400">
            {lowStockItems.length > 0 && (
              <li className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-200">{lowStockItems.length} item{lowStockItems.length !== 1 ? "s" : ""} low in stock</p>
                  <p className="text-xs text-slate-500">Review and reorder</p>
                </div>
                <span className="text-xs text-slate-500 whitespace-nowrap">Live</span>
              </li>
            )}
            {outOfStockItems.length > 0 && (
              <li className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-200">{outOfStockItems.length} item{outOfStockItems.length !== 1 ? "s" : ""} out of stock</p>
                  <p className="text-xs text-slate-500">View and restock now</p>
                </div>
                <span className="text-xs text-slate-500 whitespace-nowrap">Live</span>
              </li>
            )}
            <li className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-slate-200">PO #1052 is delayed</p>
                <p className="text-xs text-slate-500">Expected May 20, 2026</p>
              </div>
              <span className="text-xs text-slate-500 whitespace-nowrap">3h ago</span>
            </li>
            <li className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-slate-200">Stock In completed</p>
                <p className="text-xs text-slate-500">PO #1051 received</p>
              </div>
              <span className="text-xs text-slate-500 whitespace-nowrap">5h ago</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Top Low Stock Items — live */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-200">Top Low Stock Items</h2>
            <button onClick={() => navigate("/transactions")} className="text-xs text-indigo-400 hover:underline">View all</button>
          </div>
          <table className="w-full text-sm text-slate-400">
            <thead className="text-xs text-slate-500 border-b border-slate-700">
              <tr>
                <th className="text-left pb-2">Product</th>
                <th className="text-left pb-2">SKU</th>
                <th className="text-left pb-2">Current Stock</th>
                <th className="text-left pb-2">Status</th>
                <th className="text-left pb-2">Action</th>
              </tr>
            </thead>
          </table>
          {/* fixed-height scrollable body — shows 4 rows, scrolls if more */}
          <div className="overflow-y-auto" style={{ maxHeight: "176px" }}>
            <table className="w-full text-sm text-slate-400">
              <tbody className="divide-y divide-slate-800">
                {filteredLowStock.length > 0 ? (
                  filteredLowStock.map((item) => (
                    <tr key={item.unique_code} className="hover:bg-slate-800">
                      <td className="py-3 text-slate-200">{item.product_name}</td>
                      <td className="py-3 text-xs text-slate-500">{item.unique_code || "N/A"}</td>
                      <td className="py-3 text-red-400 font-semibold">{item.quantity}</td>
                      <td className="py-3">
                        <span className="bg-amber-950 text-amber-400 text-xs px-2 py-1 rounded-full">
                          {item.quantity === 0 ? "Out of Stock" : "Low Stock"}
                        </span>
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => setReorderItem(item)}
                          className="text-xs border border-slate-600 px-2 py-1 rounded-lg hover:bg-slate-700 text-slate-300"
                        >
                          Reorder
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500 text-sm">
                      {search ? "No results found" : "All items are well stocked ✓"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Recent Stock Movements — live from Transaction.jsx API ── */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-200">Recent Stock Movements</h2>
              <p className="text-xs text-slate-500 mt-0.5">Live from sales transactions</p>
            </div>
            <button onClick={() => navigate("/transactions")} className="text-xs text-indigo-400 hover:underline">View all</button>
          </div>
          <table className="w-full text-sm text-slate-400">
            <thead className="text-xs text-slate-500 border-b border-slate-700">
              <tr>
                <th className="text-left pb-2">Product</th>
                <th className="text-left pb-2">Category</th>
                <th className="text-left pb-2">Qty Sold</th>
                <th className="text-left pb-2">Total</th>
                <th className="text-left pb-2">Time</th>
              </tr>
            </thead>
          </table>
          {/* fixed-height scrollable body — shows 4 rows, scrolls if more */}
          <div className="overflow-y-auto" style={{ maxHeight: "176px" }}>
            <table className="w-full text-sm text-slate-400">
              <tbody className="divide-y divide-slate-800">
                {salesLoading ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500 text-sm">
                      Loading transactions...
                    </td>
                  </tr>
                ) : salesData.length > 0 ? (
                  salesData.map((t, i) => (
                    <tr key={t.reference || i} className="hover:bg-slate-800">
                      <td className="py-3">
                        <p className="text-slate-200 text-xs truncate max-w-[100px]">{t.product}</p>
                        <p className="text-xs text-slate-500">{t.sku}</p>
                      </td>
                      <td className="py-3 text-xs text-slate-400 capitalize">{t.location}</td>
                      <td className="py-3 font-semibold text-emerald-400">{t.quantity}</td>
                      <td className="py-3 font-semibold text-emerald-400">{fmtCurrency(t.totalValue)}</td>
                      <td className="py-3 text-xs text-slate-500 whitespace-nowrap">{t.time}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500 text-sm">No movements recorded yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div onClick={() => setShowAddProduct(true)} className="bg-slate-900 p-5 rounded-xl border border-slate-700 flex items-center gap-4 cursor-pointer hover:bg-slate-800">
          <div className="bg-indigo-950 p-3 rounded-xl text-xl">➕</div>
          <div>
            <p className="text-sm font-semibold text-slate-200">Add Product</p>
            <p className="text-xs text-slate-500">Add new product to inventory</p>
          </div>
        </div>
        <div onClick={() => setShowCreatePO(true)} className="bg-slate-900 p-5 rounded-xl border border-slate-700 flex items-center gap-4 cursor-pointer hover:bg-slate-800">
          <div className="bg-indigo-950 p-3 rounded-xl text-xl">📋</div>
          <div>
            <p className="text-sm font-semibold text-slate-200">Create PO</p>
            <p className="text-xs text-slate-500">Create new purchase order</p>
          </div>
        </div>
        <div onClick={() => navigate("/transactions")} className="bg-slate-900 p-5 rounded-xl border border-slate-700 flex items-center gap-4 cursor-pointer hover:bg-slate-800">
          <div className="bg-indigo-950 p-3 rounded-xl text-xl">📦</div>
          <div>
            <p className="text-sm font-semibold text-slate-200">Stock In</p>
            <p className="text-xs text-slate-500">Receive products to inventory</p>
          </div>
        </div>
        <div onClick={() => navigate("/reports")} className="bg-slate-900 p-5 rounded-xl border border-slate-700 flex items-center gap-4 cursor-pointer hover:bg-slate-800">
          <div className="bg-indigo-950 p-3 rounded-xl text-xl">📊</div>
          <div>
            <p className="text-sm font-semibold text-slate-200">Reports</p>
            <p className="text-xs text-slate-500">View inventory reports</p>
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3500} hideProgressBar={false} theme="dark" />
    </main>
  );
}

export default Dashboard;
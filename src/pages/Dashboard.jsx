import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

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
  { day: "May 3", value: 175000 },
  { day: "May 8", value: 190000 },
  { day: "May 13", value: 210000 },
  { day: "May 18", value: 245680 },
];

const donutData = [
  { name: "In Stock", value: 782, color: "#22c55e" },
  { name: "Low Stock", value: 23, color: "#eab308" },
  { name: "Out of Stock", value: 15, color: "#ef4444" },
  { name: "Overstock", value: 23, color: "#6366f1" },
];

const allLowStockItems = [
  { product: "Wireless Earbuds", sku: "WE-1001", stock: 3 },
  { product: "Premium Coffee Beans", sku: "CF-2002", stock: 5 },
  { product: "Ergonomic Chair", sku: "CH-3003", stock: 2 },
  { product: "Printer Ink Cartridge", sku: "IC-4004", stock: 4 },
];

function Dashboard() {
  const [chartRange, setChartRange] = useState("7 Days");
  const [search, setSearch] = useState("");
  const [reorderItem, setReorderItem] = useState(null);
  const [reorderQty, setReorderQty] = useState(10);
  const [reorderSuccess, setReorderSuccess] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showCreatePO, setShowCreatePO] = useState(false);
  const [addProductSuccess, setAddProductSuccess] = useState(false);
  const [createPOSuccess, setCreatePOSuccess] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", sku: "", qty: "", category: "" });
  const [newPO, setNewPO] = useState({ supplier: "", product: "", qty: "", notes: "" });
  const navigate = useNavigate();

  const lineData = chartRange === "7 Days" ? lineData7Days : lineData30Days;

  const filteredItems = allLowStockItems.filter(
    (item) =>
      item.product.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleReorderConfirm = () => {
    setReorderSuccess(true);
    setTimeout(() => {
      setReorderSuccess(false);
      setReorderItem(null);
      setReorderQty(10);
    }, 2000);
  };

  const handleAddProductConfirm = () => {
    setAddProductSuccess(true);
    setTimeout(() => {
      setAddProductSuccess(false);
      setShowAddProduct(false);
      setNewProduct({ name: "", sku: "", qty: "", category: "" });
    }, 2000);
  };

  const handleCreatePOConfirm = () => {
    setCreatePOSuccess(true);
    setTimeout(() => {
      setCreatePOSuccess(false);
      setShowCreatePO(false);
      setNewPO({ supplier: "", product: "", qty: "", notes: "" });
    }, 2000);
  };

  const inputClass =
    "w-full px-4 py-2 border border-slate-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-700 text-slate-100 placeholder-slate-400";

  return (
    <main className="flex-1 bg-slate-800 p-8">

      {reorderItem && (
        <div className="fixed inset-0 bg-slate-950 bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl p-8 w-full max-w-md">
            {reorderSuccess ? (
              <div className="flex flex-col items-center justify-center gap-3 py-6">
                <span className="text-4xl">✅</span>
                <p className="text-slate-100 font-semibold text-lg">Reorder Placed!</p>
                <p className="text-slate-400 text-sm">Your order for {reorderItem.product} has been submitted.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-slate-100">Reorder Product</h2>
                  <button onClick={() => setReorderItem(null)} className="text-slate-400 hover:text-slate-200 text-xl">✕</button>
                </div>
                <div className="bg-slate-700 p-4 rounded-xl mb-6">
                  <p className="text-sm font-medium text-slate-100">{reorderItem.product}</p>
                  <p className="text-xs text-slate-400 mt-1">SKU: {reorderItem.sku}</p>
                  <p className="text-xs text-red-400 mt-1">Current Stock: {reorderItem.stock}</p>
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

      {showAddProduct && (
        <div className="fixed inset-0 bg-slate-950 bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl p-8 w-full max-w-md">
            {addProductSuccess ? (
              <div className="flex flex-col items-center justify-center gap-3 py-6">
                <span className="text-4xl">✅</span>
                <p className="text-slate-100 font-semibold text-lg">Product Added!</p>
                <p className="text-slate-400 text-sm">Your new product has been added to inventory.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-slate-100">Add Product</h2>
                  <button onClick={() => setShowAddProduct(false)} className="text-slate-400 hover:text-slate-200 text-xl">✕</button>
                </div>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Product Name</label>
                    <input type="text" placeholder="e.g. Wireless Mouse" value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">SKU</label>
                    <input type="text" placeholder="e.g. WM-1005" value={newProduct.sku}
                      onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Initial Quantity</label>
                    <input type="number" min={0} placeholder="e.g. 50" value={newProduct.qty}
                      onChange={(e) => setNewProduct({ ...newProduct, qty: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Category</label>
                    <select value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} className={inputClass}>
                      <option value="">Select category</option>
                      <option>Electronics</option>
                      <option>Groceries</option>
                      <option>Furniture</option>
                      <option>Office Supplies</option>
                      <option>Accessories</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setShowAddProduct(false)} className="flex-1 px-4 py-2 border border-slate-600 rounded-xl text-sm text-slate-300 hover:bg-slate-700">Cancel</button>
                  <button onClick={handleAddProductConfirm} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-500">Add Product</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

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
                    <input type="text" placeholder="e.g. Fresh Supplies Co." value={newPO.supplier}
                      onChange={(e) => setNewPO({ ...newPO, supplier: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Product</label>
                    <input type="text" placeholder="e.g. Wireless Earbuds" value={newPO.product}
                      onChange={(e) => setNewPO({ ...newPO, product: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Quantity</label>
                    <input type="number" min={1} placeholder="e.g. 100" value={newPO.qty}
                      onChange={(e) => setNewPO({ ...newPO, qty: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Notes</label>
                    <textarea placeholder="Any additional notes..." value={newPO.notes}
                      onChange={(e) => setNewPO({ ...newPO, notes: e.target.value })}
                      className={`${inputClass} resize-none h-20`} />
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
            <option>May 12 – May 18, 2024</option>
            <option>Last 30 Days</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-700">
          <p className="text-xs text-slate-400 mb-1">Total Inventory Value</p>
          <p className="text-2xl font-bold text-slate-100">$245,680.00</p>
          <p className="text-xs text-emerald-400 mt-1">▲ 12.5% vs last week</p>
        </div>
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-700">
          <p className="text-xs text-slate-400 mb-1">Total Products</p>
          <p className="text-2xl font-bold text-slate-100">1,248</p>
          <p className="text-xs text-emerald-400 mt-1">▲ 8.3% vs last week</p>
        </div>
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-700">
          <p className="text-xs text-slate-400 mb-1">Low Stock Items</p>
          <p className="text-2xl font-bold text-slate-100">23</p>
          <p className="text-xs text-red-400 mt-1">▲ 4 vs last week</p>
        </div>
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-700">
          <p className="text-xs text-slate-400 mb-1">Stock Movements</p>
          <p className="text-2xl font-bold text-slate-100">356</p>
          <p className="text-xs text-emerald-400 mt-1">▲ 15.7% vs last week</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

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
              <li className="flex justify-between gap-4"><span>🟢 In Stock</span><span>782 (62.7%)</span></li>
              <li className="flex justify-between gap-4"><span>🟡 Low Stock</span><span>23 (18.4%)</span></li>
              <li className="flex justify-between gap-4"><span>🔴 Out of Stock</span><span>15 (12.0%)</span></li>
              <li className="flex justify-between gap-4"><span>🔵 Overstock</span><span>23 (6.9%)</span></li>
            </ul>
          </div>
          <div className="flex justify-between mt-2 text-sm font-semibold text-slate-200 border-t border-slate-700 pt-3">
            <span>Total</span>
            <span>1,248</span>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 h-72">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-200">Recent Alerts</h2>
            <button onClick={() => navigate("/alerts")} className="text-xs text-indigo-400 hover:underline">
              View all
            </button>
          </div>
          <ul className="space-y-4 text-sm text-slate-400">
            <li className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-slate-200">15 items out of stock</p>
                <p className="text-xs text-slate-500">View and restock now</p>
              </div>
              <span className="text-xs text-slate-500 whitespace-nowrap">10m ago</span>
            </li>
            <li className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-slate-200">23 items low in stock</p>
                <p className="text-xs text-slate-500">Review and reorder</p>
              </div>
              <span className="text-xs text-slate-500 whitespace-nowrap">1h ago</span>
            </li>
            <li className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-slate-200">PO #1052 is delayed</p>
                <p className="text-xs text-slate-500">Expected May 20, 2024</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-200">Top Low Stock Items</h2>
            <button onClick={() => navigate("/transactions")} className="text-xs text-indigo-400 hover:underline">
              View all
            </button>
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
            <tbody className="divide-y divide-slate-800">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <tr key={item.sku} className="hover:bg-slate-800">
                    <td className="py-3 text-slate-200">{item.product}</td>
                    <td className="py-3 text-xs text-slate-500">{item.sku}</td>
                    <td className="py-3 text-red-400 font-semibold">{item.stock}</td>
                    <td className="py-3">
                      <span className="bg-amber-950 text-amber-400 text-xs px-2 py-1 rounded-full">Low Stock</span>
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
                  <td colSpan={5} className="py-6 text-center text-slate-500 text-sm">No results found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-200">Recent Stock Movements</h2>
            <button onClick={() => navigate("/transactions")} className="text-xs text-indigo-400 hover:underline">
              View all
            </button>
          </div>
          <table className="w-full text-sm text-slate-400">
            <thead className="text-xs text-slate-500 border-b border-slate-700">
              <tr>
                <th className="text-left pb-2">Type</th>
                <th className="text-left pb-2">Product</th>
                <th className="text-left pb-2">Qty</th>
                <th className="text-left pb-2">Location</th>
                <th className="text-left pb-2">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              <tr className="hover:bg-slate-800">
                <td className="py-3 text-emerald-400 font-medium">⬇️ Stock In</td>
                <td className="py-3 text-slate-200">Wireless Earbuds</td>
                <td className="py-3 text-emerald-400 font-semibold">+50</td>
                <td className="py-3 text-xs text-slate-500">Main Warehouse</td>
                <td className="py-3 text-xs text-slate-500">1h ago</td>
              </tr>
              <tr className="hover:bg-slate-800">
                <td className="py-3 text-red-400 font-medium">⬆️ Stock Out</td>
                <td className="py-3 text-slate-200">Premium Coffee Beans</td>
                <td className="py-3 text-red-400 font-semibold">-20</td>
                <td className="py-3 text-xs text-slate-500">Main Warehouse</td>
                <td className="py-3 text-xs text-slate-500">3h ago</td>
              </tr>
              <tr className="hover:bg-slate-800">
                <td className="py-3 text-emerald-400 font-medium">⬇️ Stock In</td>
                <td className="py-3 text-slate-200">Ergonomic Chair</td>
                <td className="py-3 text-emerald-400 font-semibold">+10</td>
                <td className="py-3 text-xs text-slate-500">Main Warehouse</td>
                <td className="py-3 text-xs text-slate-500">5h ago</td>
              </tr>
              <tr className="hover:bg-slate-800">
                <td className="py-3 text-indigo-400 font-medium">🔄 Transfer</td>
                <td className="py-3 text-slate-200">Printer Ink Cartridge</td>
                <td className="py-3 text-indigo-400 font-semibold">+5</td>
                <td className="py-3 text-xs text-slate-500">Warehouse B</td>
                <td className="py-3 text-xs text-slate-500">1d ago</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setShowAddProduct(true)}
          className="bg-slate-900 p-5 rounded-xl border border-slate-700 flex items-center gap-4 cursor-pointer hover:bg-slate-800"
        >
          <div className="bg-indigo-950 p-3 rounded-xl text-xl">➕</div>
          <div>
            <p className="text-sm font-semibold text-slate-200">Add Product</p>
            <p className="text-xs text-slate-500">Add new product to inventory</p>
          </div>
        </div>
        <div
          onClick={() => setShowCreatePO(true)}
          className="bg-slate-900 p-5 rounded-xl border border-slate-700 flex items-center gap-4 cursor-pointer hover:bg-slate-800"
        >
          <div className="bg-indigo-950 p-3 rounded-xl text-xl">🛒</div>
          <div>
            <p className="text-sm font-semibold text-slate-200">Create PO</p>
            <p className="text-xs text-slate-500">Create new purchase order</p>
          </div>
        </div>
        <div
          onClick={() => navigate("/transactions")}
          className="bg-slate-900 p-5 rounded-xl border border-slate-700 flex items-center gap-4 cursor-pointer hover:bg-slate-800"
        >
          <div className="bg-indigo-950 p-3 rounded-xl text-xl">📥</div>
          <div>
            <p className="text-sm font-semibold text-slate-200">Stock In</p>
            <p className="text-xs text-slate-500">Receive products to inventory</p>
          </div>
        </div>
        <div
          onClick={() => navigate("/reports")}
          className="bg-slate-900 p-5 rounded-xl border border-slate-700 flex items-center gap-4 cursor-pointer hover:bg-slate-800"
        >
          <div className="bg-indigo-950 p-3 rounded-xl text-xl">📄</div>
          <div>
            <p className="text-sm font-semibold text-slate-200">Reports</p>
            <p className="text-xs text-slate-500">View inventory reports</p>
          </div>
        </div>
      </div>

    </main>
  );
}

export default Dashboard;
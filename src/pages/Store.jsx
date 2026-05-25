import { useState, useEffect, useRef } from "react";
import { useInventory } from "./InventoryContext";
import apiClient from "../api/client";
import { useReactToPrint } from "react-to-print"; 
import {Receipt} from "../components/receipt/Receipt"; 

const formatNaira = (amount) => "₦" + Number(amount).toLocaleString("en-NG");

function useClockTick() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return time.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function Store() {
  const { products, refreshProducts } = useInventory(); // Destructured missing refreshProducts function context safely

  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [paymentModal, setPaymentModal] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [sellError, setSellError] = useState(null);
  const [stockWarning, setStockWarning] = useState("");
  const clock = useClockTick();
  const [loading, setLoading] = useState(false);

  // Cashier parsing from sessionStorage or fallback configuration context structures
  const [cashierName, setCashierName] = useState("Sales Assistant");

  // Create references targeting the hidden thermal layouts element structures
  const receiptRef = useRef();

  // Configure print system runtime controls
  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: "POS_Sale_Receipt",
  });

  // Decode cashier info on initial component mounting hook iterations
  useEffect(() => {
    try {
      const token = sessionStorage.getItem("token");
      if (token) {
        // Safe check to decode payload parameters if JWT configurations are configured matching your API structure
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        const user = JSON.parse(jsonPayload);
        if (user?.name || user?.username) {
          setCashierName(user.name || user.username);
        }
      }
    } catch (e) {
      // console.log("Token details parsing unavailable", e);
    }
  }, []);

  useEffect(() => {
    if (!stockWarning) return;
    const t = setTimeout(() => setStockWarning(""), 3000);
    return () => clearTimeout(t);
  }, [stockWarning]);

  const filtered = products.filter(
    (p) =>
      p.product_name.toLowerCase().includes(search.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
  );

  const addToCart = (product) => {
    if (product.quantity === 0) return;
    setCart((prev) => {
      const existing = prev.find((i) => i._id === product._id);
      if (existing) {
        return prev.map((i) =>
          i._id === product._id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id) =>
    setCart((prev) => prev.filter((i) => i._id !== id));

  const changeQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i._id !== id) return i;
          const newQty = i.qty + delta;
          return { ...i, qty: newQty };
        })
        .filter((i) => i.qty > 0)
    );
  };

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const hasStockExceeded = cart.some((i) => i.qty > i.quantity);

  const validatePhone = (value) => {
    const digits = value.replace(/\D/g, "");
    if (!value.trim()) return "Phone number is required.";
    if (digits.length < 10) return "Phone number must be at least 10 digits.";
    if (!/^\+?[\d\s\-().]{10,}$/.test(value)) return "Enter a valid phone number.";
    return "";
  };

  const handlePhoneChange = (e) => {
    setPhone(e.target.value);
    if (phoneError) setPhoneError(validatePhone(e.target.value));
  };

  const handleProceed = () => {
    if (cart.length === 0) return alert("Cart is empty.");
    if (!customerName.trim()) return alert("Please enter customer name.");
    const err = validatePhone(phone);
    if (err) {
      setPhoneError(err);
      return;
    }
    setPhoneError("");
    setSellError(null);
    setPaymentModal(true);
  };

  const confirmPayment = async () => {
    setSellError(null);
    setLoading(true);
    try {
      if (cart.length === 0) {
        setSellError("Cart is empty");
        return;
      }

      const token = sessionStorage.getItem("token");

      if (!token) {
        setSellError("Session expired. Please login again.");
        return;
      }

      for (const item of cart) {
        await apiClient.post(`/products/${item.unique_code}/sell`, {
          quantity_sold: item.qty,
        });
      }

      setPaymentDone(true);
      setPaymentModal(false);

      // Trigger standard physical print window immediately following system API validation confirmations
      setTimeout(() => {
        handlePrint();
      }, 100);

      setTimeout(() => {
        setCart([]);
        setCustomerName("");
        setPhone("");
        setPaymentDone(false);
      }, 2000);

      await refreshProducts();
    } catch (err) {
      const message = err.response?.data?.message || "Sale failed. Please try again.";
      setSellError(message);
    } finally {
      setLoading(false);
    }
  };

  // Modern print handler replaces string array map window generation mechanics
  const handleReprint = () => {
    if (cart.length === 0) return alert("No receipt items present to print.");
    handlePrint();
  };

  return (
    <div style={s.root}>
      {/* ─── HIDDEN ACCESSIBILITY COMPONENT NODE USED FOR OS THERMAL ROUTING ─── */}
      <div style={{ display: "none" }}>
        <Receipt
          ref={receiptRef}
          cart={cart}
          total={total}
          customerName={customerName}
          customerPhone={phone}
          cashierName={cashierName}
        />
      </div>

      <aside style={{ ...s.sidebar, width: sidebarOpen ? 196 : 52 }}>
        <nav style={s.nav}>
          <div style={s.navItem}>
            <span style={s.navIcon}>🖥</span>
            {sidebarOpen && <span style={s.navLabel}>Store</span>}
          </div>
        </nav>
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          style={s.collapseBtn}
          title="Toggle sidebar"
        >
          {sidebarOpen ? "‹" : "›"}
        </button>
      </aside>

      <div style={s.main}>
        <header style={s.topbar}>
          <h2 style={s.pageTitle}>Store</h2>
          <div style={s.topbarRight}>
            <button style={s.btnLogout}>Logout</button>
            <button style={s.btnReprint} onClick={handleReprint}>
              🎫 Print / Re-print Receipt
            </button>
          </div>
        </header>

        {stockWarning && <div style={s.warningToast}>⚠️ {stockWarning}</div>}

        <div style={s.content}>
          <div style={s.gridArea}>
            <input
              style={s.searchInput}
              placeholder="Search products by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div style={s.grid}>
              {filtered.length === 0 && (
                <p style={{ color: "#9ca3af", gridColumn: "1/-1" }}>
                  No products match your search.
                </p>
              )}
              {filtered.map((product) => {
                const isOutOfStock = product.quantity === 0;
                return (
                  <div
                    key={product._id}
                    style={{
                      ...s.card,
                      cursor: isOutOfStock ? "not-allowed" : "pointer",
                      opacity: isOutOfStock ? 0.75 : 1,
                    }}
                    onClick={() => !isOutOfStock && addToCart(product)}
                  >
                    <div style={{ ...s.cardImg, position: "relative" }}>
                      {isOutOfStock && (
                        <div style={s.outOfStockOverlay}>OUT OF STOCK</div>
                      )}
                    </div>
                    <div style={s.cardBody}>
                      <p style={s.cardBrand}>
                        {product.category || "Uncategorized"}
                      </p>
                      <p style={s.cardName}>{product.product_name}</p>
                      <p style={s.cardPrice}>
                        {formatNaira(product.price)}{" "}
                        <span style={s.perUnit}>/unit</span>
                      </p>
                      {isOutOfStock ? (
                        <p style={s.outOfStockTag}>Out of Stock</p>
                      ) : (
                        <p style={s.cardSize}>
                          SKU: {product.unique_code || "N/A"}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <aside style={s.cartPanel}>
            <div style={s.cartHeader}>
              <span style={s.cartTitle}>Cart Items</span>
              <span style={s.cartBadge}>{cartCount}</span>
            </div>

            <input
              style={s.cartInput}
              placeholder="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <div>
              <input
                style={{
                  ...s.cartInput,
                  borderColor: phoneError ? "#ef4444" : "#d1d5db",
                }}
                placeholder="Phone Number"
                value={phone}
                onChange={handlePhoneChange}
              />
              {phoneError && <p style={s.phoneError}>{phoneError}</p>}
            </div>

            <div style={s.cartItems}>
              {cart.length === 0 ? (
                <p style={s.emptyCart}>
                  No items in cart.
                  <br />
                  Click a product to add.
                </p>
              ) : (
                cart.map((item) => (
                  <div key={item._id} style={s.cartItem}>
                    <div style={s.cartItemTop}>
                      <div>
                        <p style={s.cartItemName}>{item.product_name}</p>
                        <p style={s.cartItemTag}>
                          {item.category || "UNCATEGORIZED"}
                        </p>
                      </div>
                      <button
                        style={s.removeBtn}
                        onClick={() => removeFromCart(item._id)}
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>

                    <div style={s.cartItemDims}>
                      <div style={s.dimBox}>
                        <label style={s.dimLabel}>SKU</label>
                        <input
                          style={s.dimInput}
                          value={item.unique_code || "N/A"}
                          readOnly
                        />
                      </div>
                      <div style={s.dimBox}>
                        <label style={s.dimLabel}>Stock</label>
                        <input
                          style={s.dimInput}
                          value={item.quantity}
                          readOnly
                        />
                      </div>
                      <div style={s.dimBox}>
                        <label style={s.dimLabel}>Rate (₦)</label>
                        <input
                          style={s.dimInput}
                          value={Number(item.price).toLocaleString()}
                          readOnly
                        />
                      </div>
                    </div>

                    <div style={s.cartItemBottom}>
                      <div style={s.qtyControl}>
                        <button
                          style={s.qtyBtn}
                          onClick={() => changeQty(item._id, -1)}
                        >
                          −
                        </button>
                        <span style={s.qty}>{item.qty}</span>
                        <button
                          style={s.qtyBtn}
                          onClick={() => changeQty(item._id, 1)}
                        >
                          +
                        </button>
                      </div>
                      <div style={s.subtotalBox}>
                        <span style={s.subtotalLabel}>Subtotal</span>
                        <span style={s.subtotalAmt}>
                          {formatNaira(item.price * item.qty)}
                        </span>
                      </div>
                    </div>

                    {item.qty > item.quantity && (
                      <p style={s.itemStockWarning}>
                        ⚠️ Exceeds available stock ({item.quantity} units) — reduce qty to proceed
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            <div style={s.totalRow}>
              <span style={s.totalLabel}>Total Amount:</span>
              <span style={s.totalAmt}>{formatNaira(total)}</span>
            </div>

            <button
              style={{
                ...s.proceedBtn,
                opacity: cart.length === 0 || hasStockExceeded ? 0.5 : 1,
                cursor: cart.length === 0 || hasStockExceeded ? "not-allowed" : "pointer",
              }}
              onClick={handleProceed}
              disabled={cart.length === 0 || hasStockExceeded}
            >
              Proceed to Payment
            </button>

            {paymentDone && (
              <p style={s.successMsg}>✅ Payment confirmed! Receipt ready.</p>
            )}
          </aside>
        </div>
      </div>

      {paymentModal && (
        <div style={s.modalOverlay}>
          <div style={s.modal}>
            <h3 style={s.modalTitle}>Confirm Payment</h3>
            <p style={s.modalLine}>
              <b>Customer:</b> {customerName}
            </p>
            <p style={s.modalLine}>
              <b>Phone:</b> {phone}
            </p>
            <div style={s.modalItems}>
              {cart.map((i) => (
                <div key={i._id} style={s.modalItem}>
                  <span>
                    {i.product_name} × {i.qty}
                  </span>
                  <span>{formatNaira(i.price * i.qty)}</span>
                </div>
              ))}
            </div>
            <div style={s.modalTotal}>
              <b>Total:</b> <b>{formatNaira(total)}</b>
            </div>
            {sellError && <p style={s.errorMsg}>⚠️ {sellError}</p>}
            <div style={s.modalActions}>
              <button
                style={s.modalCancel}
                onClick={() => setPaymentModal(false)}
              >
                Cancel
              </button>
              <button style={s.modalConfirm} onClick={confirmPayment}>
                {loading ? "Processing..." : "Confirm Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


const s = {
  root: {
    display: "flex",
    height: "100vh",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    background: "#f0f2f5",
    overflow: "hidden",
  },
  sidebar: {
    background: "#fff",
    borderRight: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    padding: "20px 0",
    minHeight: "100vh",
    boxShadow: "2px 0 6px rgba(0,0,0,0.04)",
    flexShrink: 0,
    transition: "width 0.25s",
    overflow: "hidden",
  },
  nav: { flex: 1, padding: "0 8px" },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 8,
    background: "#e8f0fe",
    color: "#1d4ed8",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
    whiteSpace: "nowrap",
  },
  navIcon: { fontSize: 16, flexShrink: 0 },
  navLabel: {},
  collapseBtn: {
    alignSelf: "center",
    background: "none",
    border: "1px solid #e5e7eb",
    borderRadius: 50,
    width: 28,
    height: 28,
    cursor: "pointer",
    fontSize: 18,
    color: "#6b7280",
    margin: "8px auto 0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  topbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 28px",
    background: "#fff",
    borderBottom: "1px solid #e5e7eb",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  },
  pageTitle: { margin: 0, fontSize: 22, fontWeight: 700, color: "#111827" },
  topbarRight: { display: "flex", alignItems: "center", gap: 12 },
  btnLogout: {
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "7px 18px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 14,
  },
  btnReprint: {
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "7px 18px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 14,
  },
  warningToast: {
    margin: "0 28px",
    padding: "10px 16px",
    backgroundColor: "#fef3c7",
    border: "1px solid #f59e0b",
    borderRadius: 8,
    color: "#92400e",
    fontSize: 13,
    fontWeight: 500,
  },
  content: { flex: 1, display: "flex", overflow: "hidden" },
  gridArea: {
    flex: 1,
    padding: "20px 24px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  searchInput: {
    width: "100%",
    padding: "11px 16px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    fontSize: 14,
    outline: "none",
    background: "#fff",
    boxSizing: "border-box",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))",
    gap: 16,
  },
  card: {
    background: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    transition: "transform 0.15s, box-shadow 0.15s",
  },
  cardImg: {
    height: 140,
    background: "#e9ebee",
    borderBottom: "1px solid #e5e7eb",
  },
  outOfStockOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(239,68,68,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 800,
    color: "#ef4444",
    letterSpacing: 1,
  },
  cardBody: { padding: "10px 12px 12px" },
  cardBrand: {
    margin: 0,
    fontSize: 10,
    letterSpacing: 1,
    color: "#9ca3af",
    fontWeight: 600,
    textTransform: "uppercase",
  },
  cardName: {
    margin: "2px 0 4px",
    fontWeight: 800,
    fontSize: 15,
    color: "#111827",
  },
  cardPrice: {
    margin: "0 0 2px",
    fontWeight: 700,
    fontSize: 14,
    color: "#2563eb",
  },
  perUnit: { fontWeight: 400, fontSize: 11, color: "#9ca3af" },
  cardSize: { margin: 0, fontSize: 11, color: "#6b7280" },
  outOfStockTag: { margin: 0, fontSize: 11, fontWeight: 700, color: "#ef4444" },
  cartPanel: {
    width: 320,
    flexShrink: 0,
    background: "#fff",
    borderLeft: "1px solid #e5e7eb",
    padding: "20px 18px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    overflowY: "auto",
  },
  cartHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cartTitle: { fontWeight: 700, fontSize: 16, color: "#111827" },
  cartBadge: {
    background: "#3b82f6",
    color: "#fff",
    borderRadius: 6,
    minWidth: 24,
    height: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 13,
    padding: "0 6px",
  },
  cartInput: {
    width: "100%",
    padding: "9px 12px",
    borderRadius: 7,
    border: "1px solid #d1d5db",
    fontSize: 13,
    outline: "none",
    background: "#f9fafb",
    boxSizing: "border-box",
  },
  phoneError: {
    margin: "4px 0 0",
    fontSize: 11,
    color: "#ef4444",
    fontWeight: 500,
  },
  cartItems: { display: "flex", flexDirection: "column", gap: 10, flex: 1 },
  emptyCart: {
    color: "#9ca3af",
    fontSize: 13,
    textAlign: "center",
    marginTop: 20,
    lineHeight: 1.7,
  },
  cartItem: {
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: "10px 12px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    background: "#fafafa",
  },
  cartItemTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cartItemName: { margin: 0, fontWeight: 700, fontSize: 14, color: "#111827" },
  cartItemTag: {
    margin: 0,
    fontSize: 10,
    color: "#6b7280",
    letterSpacing: 0.5,
  },
  removeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#9ca3af",
    fontSize: 15,
    padding: 2,
  },
  cartItemDims: { display: "flex", gap: 8 },
  dimBox: { flex: 1, display: "flex", flexDirection: "column", gap: 2 },
  dimLabel: { fontSize: 10, color: "#9ca3af" },
  dimInput: {
    padding: "5px 8px",
    border: "1px solid #e5e7eb",
    borderRadius: 5,
    fontSize: 12,
    background: "#fff",
    width: "100%",
    boxSizing: "border-box",
  },
  cartItemBottom: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  qtyControl: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    border: "1px solid #e5e7eb",
    borderRadius: 6,
    padding: "2px 6px",
    background: "#fff",
  },
  qtyBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 16,
    color: "#374151",
    fontWeight: 700,
    lineHeight: 1,
    padding: "0 2px",
  },
  qty: {
    fontSize: 14,
    fontWeight: 600,
    color: "#111827",
    minWidth: 16,
    textAlign: "center",
  },
  subtotalBox: { textAlign: "right" },
  subtotalLabel: { display: "block", fontSize: 10, color: "#9ca3af" },
  subtotalAmt: { fontWeight: 700, color: "#2563eb", fontSize: 14 },
  itemStockWarning: {
    margin: 0,
    fontSize: 11,
    color: "#ef4444",
    fontWeight: 600,
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid #e5e7eb",
    paddingTop: 12,
  },
  totalLabel: { fontWeight: 600, fontSize: 15, color: "#374151" },
  totalAmt: { fontWeight: 800, fontSize: 18, color: "#111827" },
  proceedBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "13px",
    fontWeight: 700,
    fontSize: 15,
    width: "100%",
    letterSpacing: 0.3,
    transition: "opacity 0.2s",
  },
  successMsg: {
    textAlign: "center",
    color: "#16a34a",
    fontWeight: 600,
    fontSize: 14,
    margin: 0,
  },
  errorMsg: {
    textAlign: "center",
    color: "#ef4444",
    fontWeight: 500,
    fontSize: 13,
    margin: 0,
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  modal: {
    background: "#fff",
    borderRadius: 12,
    padding: "28px 28px 24px",
    width: 380,
    boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  modalTitle: { margin: 0, fontSize: 18, fontWeight: 800, color: "#111827" },
  modalLine: { margin: 0, fontSize: 14, color: "#374151" },
  modalItems: {
    borderTop: "1px solid #e5e7eb",
    borderBottom: "1px solid #e5e7eb",
    padding: "10px 0",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  modalItem: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 13,
    color: "#374151",
  },
  modalTotal: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 16,
    color: "#111827",
  },
  modalActions: { display: "flex", gap: 10, marginTop: 4 },
  modalCancel: {
    flex: 1,
    padding: "10px",
    border: "1px solid #d1d5db",
    borderRadius: 7,
    background: "#fff",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
    color: "#374151",
  },
  modalConfirm: {
    flex: 2,
    padding: "10px",
    border: "none",
    borderRadius: 7,
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 14,
  },
};

// products/sales/all

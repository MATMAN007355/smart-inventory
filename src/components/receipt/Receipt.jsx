import React from "react";

const formatNaira = (amount) => "₦" + Number(amount).toLocaleString("en-NG");

export const Receipt = React.forwardRef(({ cart, total, customerName, customerPhone, cashierName }, ref) => {
  const date = new Date().toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  
  const time = new Date().toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div style={s.printWrapper}>
      {/* Dynamic CSS injecting print margins target specifically during printing context */}
      <style>{`
        @media print {
          @page { margin: 0; size: auto; }
          body { margin: 0; padding: 0; background: #fff; }
        }
      `}</style>

      <div ref={ref} style={s.receiptContainer}>
        {/* Header section */}
        <div style={s.header}>
          <h2 style={s.storeName}>GREY & GREMA CARPET</h2>
          <p style={s.storeDetails}>
            Plot 124, Zoo Road, Kano State<br />
            Tel: +234 803 123 4567
          </p>
        </div>

        <div style={s.divider}>------------------------------------------</div>

        {/* Transaction Metadata */}
        <div style={s.metaSection}>
          <div style={s.metaRow}><span>Date:</span> <span>{date}</span></div>
          <div style={s.metaRow}><span>Time:</span> <span>{time}</span></div>
          <div style={s.metaRow}><span>Cashier:</span> <span>{cashierName || "System Admin"}</span></div>
          <div style={s.metaRow}><span>Customer:</span> <span>{customerName || "Walk-in"}</span></div>
          {customerPhone && (
            <div style={s.metaRow}><span>Phone:</span> <span>{customerPhone}</span></div>
          )}
        </div>

        <div style={s.divider}>==========================================</div>

        {/* Sale Items Table Grid Layout */}
        <div style={s.itemsTable}>
          <div style={s.tableHeader}>
            <span style={s.colDesc}>Item Description</span>
            <span style={s.colQty}>Qty</span>
            <span style={s.colPrice}>Total</span>
          </div>
          <div style={s.divider}>------------------------------------------</div>
          
          {cart.map((item) => (
            <div key={item._id} style={s.itemRow}>
              <div style={s.itemName}>{item.product_name}</div>
              <div style={s.itemCalculations}>
                <span style={s.colDesc}>@{formatNaira(item.price)}</span>
                <span style={s.colQty}>x{item.qty}</span>
                <span style={s.colPrice}>{formatNaira(item.price * item.qty)}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={s.divider}>------------------------------------------</div>

        {/* Totals Section */}
        <div style={s.totalContainer}>
          <div style={s.totalRow}>
            <span style={s.totalLabel}>TOTAL UNITS:</span>
            <span style={s.totalVal}>{cart.reduce((sum, i) => sum + i.qty, 0)}</span>
          </div>
          <div style={{ ...s.totalRow, marginTop: 4 }}>
            <span style={s.totalLabel}>NET TOTAL:</span>
            <span style={s.totalVal}>{formatNaira(total)}</span>
          </div>
        </div>

        <div style={s.divider}>==========================================</div>

        {/* Footer message area */}
        <div style={s.footer}>
          <p style={s.footerText}>THANK YOU FOR YOUR PATRONAGE!</p>
          <p style={s.footerSubtext}>No refund of money after payment.</p>
        </div>
      </div>
    </div>
  );
});

Receipt.displayName = "Receipt";

// POS 80mm scoped thermal layout optimization structures
const s = {
  printWrapper: {
    display: "none", // Keeps it hidden completely in standard browser layout views
  },
  receiptContainer: {
    width: "76mm", // Clean safe frame margins inside standard 80mm thermal rolls
    margin: "0 auto",
    padding: "4mm 2mm 10mm 2mm",
    backgroundColor: "#fff",
    color: "#000",
    fontFamily: "'Courier New', Courier, monospace",
    fontSize: "12px",
    lineHeight: "1.4",
  },
  header: {
    textAlign: "center",
    marginBottom: "6px",
  },
  storeName: {
    margin: "0 0 4px 0",
    fontSize: "15px",
    fontWeight: "bold",
    letterSpacing: "0.5px",
  },
  storeDetails: {
    margin: 0,
    fontSize: "11px",
    whiteSpace: "pre-line",
  },
  divider: {
    textAlign: "center",
    margin: "3px 0",
    fontSize: "11px",
    letterSpacing: "-0.5px",
  },
  metaSection: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    fontSize: "11px",
  },
  metaRow: {
    display: "flex",
    justifyContent: "space-between",
  },
  itemsTable: {
    display: "flex",
    flexDirection: "column",
  },
  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    fontWeight: "bold",
    fontSize: "11px",
  },
  itemRow: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "6px",
  },
  itemName: {
    fontWeight: "bold",
    fontSize: "12px",
    textTransform: "uppercase",
  },
  itemCalculations: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "11px",
    color: "#333",
  },
  colDesc: { flex: 2, textAlign: "left" },
  colQty: { flex: 1, textAlign: "center" },
  colPrice: { flex: 1, textAlign: "right", fontWeight: "bold" },
  totalContainer: {
    display: "flex",
    flexDirection: "column",
    padding: "2px 0",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
  },
  totalLabel: {
    fontWeight: "bold",
    fontSize: "12px",
  },
  totalVal: {
    fontWeight: "bold",
    fontSize: "13px",
  },
  footer: {
    textAlign: "center",
    marginTop: "12px",
  },
  footerText: {
    margin: "0 0 2px 0",
    fontWeight: "bold",
    fontSize: "11px",
  },
  footerSubtext: {
    margin: 0,
    fontSize: "10px",
    fontStyle: "italic",
  },
};
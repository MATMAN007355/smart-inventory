// useSalesData.js
// Shared hook — fetches /products/sales/all and maps to the same row shape
// used by Transaction.jsx. Import this in Dashboard to get live sales data.

import { useState, useEffect } from "react";
import apiClient from "../api/client";

function mapSaleToRow(sale) {
  const dateObj = new Date(sale.createdAt);
  return {
    dateObj,
    time: dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    type: "Stock Out",
    product: sale.product_name,
    sku: sale.unique_code,
    reference: sale._id,
    location: sale.product?.category || "—",
    quantity: String(Math.abs(parseFloat(sale.quantity_sold) || 0)),
    unitCost: sale.price,
    totalValue: Math.abs(sale.total_amount),
    performer: `${sale.sold_by?.first_name ?? ""} ${sale.sold_by?.last_name ?? ""}`.trim(),
    email: sale.sold_by?.email || "—",
  };
}

export function useSalesData() {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    setLoading(true);
    apiClient.get("/products/sales/all")
      .then((res) => {
        const rows = (res.data?.data ?? res.data ?? []).map(mapSaleToRow);
        // newest first
        rows.sort((a, b) => b.dateObj - a.dateObj);
        setSalesData(rows);
      })
      .catch((err) => {
        console.error("useSalesData error:", err);
        setError(err);
      })
      .finally(() => setLoading(false));
  }, []);

  return { salesData, loading, error };
}
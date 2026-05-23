import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import apiClient from "../api/client";

const InventoryContext = createContext(null);

export function InventoryProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stockMovements, setStockMovements] = useState([]);
  const prevProductsRef = useRef([]);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await apiClient.get("/products");
      if (response.data && response.data.data) {
        const incoming = response.data.data;

        // Detect stock movements by comparing with previous snapshot
        if (prevProductsRef.current.length > 0) {
          const newMovements = [];
          incoming.forEach((product) => {
            const prev = prevProductsRef.current.find(
              (p) => p.unique_code === product.unique_code
            );
            if (prev && prev.quantity !== product.quantity) {
              const diff = product.quantity - prev.quantity;
              newMovements.push({
                id: `${product.unique_code}-${Date.now()}`,
                type: diff > 0 ? "Stock In" : "Stock Out",
                product: product.product_name,
                qty: diff,
                location: "Main Warehouse",
                time: "Just now",
              });
            }
          });
          // Detect newly added products
          incoming.forEach((product) => {
            const existed = prevProductsRef.current.find(
              (p) => p.unique_code === product.unique_code
            );
            if (!existed) {
              newMovements.push({
                id: `${product.unique_code}-new-${Date.now()}`,
                type: "Stock In",
                product: product.product_name,
                qty: product.quantity,
                location: "Main Warehouse",
                time: "Just now",
              });
            }
          });

          if (newMovements.length > 0) {
            setStockMovements((prev) => [...newMovements, ...prev].slice(0, 20));
          }
        }

        prevProductsRef.current = incoming;
        setProducts(incoming);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to fetch products";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Poll every 10 seconds to keep dashboard in sync after product changes
  useEffect(() => {
    const interval = setInterval(fetchProducts, 10000);
    return () => clearInterval(interval);
  }, [fetchProducts]);

  // ─── Derived dashboard stats ────────────────────────────────────────────────

  const totalInventoryValue = products.reduce(
    (sum, p) => sum + Number(p.price || 0) * Number(p.quantity || 0),
    0
  );

  const totalProducts = products.length;

  // Low stock: quantity > 0 but <= 10 (reasonable threshold)
  const LOW_STOCK_THRESHOLD = 10;
  const lowStockItems = products.filter(
    (p) => p.quantity > 0 && p.quantity <= LOW_STOCK_THRESHOLD
  );
  const outOfStockItems = products.filter((p) => p.quantity === 0);
  const inStockItems = products.filter((p) => p.quantity > LOW_STOCK_THRESHOLD);

  // Overstock: quantity > 500
  const overstockItems = products.filter((p) => p.quantity > 500);

  const donutData = [
    { name: "In Stock", value: inStockItems.length, color: "#22c55e" },
    { name: "Low Stock", value: lowStockItems.length, color: "#eab308" },
    { name: "Out of Stock", value: outOfStockItems.length, color: "#ef4444" },
    { name: "Overstock", value: overstockItems.length, color: "#6366f1" },
  ];

  // ─── Mutations (so Products page can call these and context stays in sync) ──

  const addProduct = useCallback(async (payload) => {
    await apiClient.post("/products", payload);
    // Track as new stock movement immediately
    setStockMovements((prev) =>
      [
        {
          id: `new-${Date.now()}`,
          type: "Stock In",
          product: payload.product_name,
          qty: payload.quantity,
          location: "Main Warehouse",
          time: "Just now",
        },
        ...prev,
      ].slice(0, 20)
    );
    await fetchProducts();
  }, [fetchProducts]);

  const updateProduct = useCallback(async (code, form) => {
    const response = await apiClient.put(`/products/${code}`, form);
    if (response.data && response.data.success) {
      const updated = response.data.data;
      setProducts((prev) =>
        prev.map((p) => (p.unique_code === code ? updated : p))
      );
      prevProductsRef.current = prevProductsRef.current.map((p) =>
        p.unique_code === code ? updated : p
      );
    }
    return response;
  }, []);

  const deleteProduct = useCallback(async (code) => {
    const response = await apiClient.delete(`/products/${code}`);
    if (response.status === 200 || response.data?.success) {
      setProducts((prev) => prev.filter((p) => p.unique_code !== code));
      prevProductsRef.current = prevProductsRef.current.filter(
        (p) => p.unique_code !== code
      );
    }
    return response;
  }, []);

  const viewProduct = useCallback(async (code) => {
    const response = await apiClient.get(`/products/${code}`);
    return response.data?.data;
  }, []);

  return (
    <InventoryContext.Provider
      value={{
        products,
        loading,
        error,
        stockMovements,
        fetchProducts,
        // Derived stats
        totalInventoryValue,
        totalProducts,
        lowStockItems,
        outOfStockItems,
        inStockItems,
        overstockItems,
        donutData,
        LOW_STOCK_THRESHOLD,
        // Mutations
        addProduct,
        updateProduct,
        deleteProduct,
        viewProduct,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error("useInventory must be used inside <InventoryProvider>");
  return ctx;
}
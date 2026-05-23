import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import Dashboard from "./pages/Dashboard"
import Transaction from "./pages/Transaction"
import Layout from "./pages/Layout"
import Analytics from "./pages/Analytics"
import Alerts from "./pages/Alerts"
import Reports from "./pages/Reports"
import Settings from "./pages/settings"
import { SettingsProvider } from "./pages/settings"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Products from "./pages/Procducts"
import Users from "./pages/Users"
import Store from "./pages/Store"
import { InventoryProvider } from "./pages/InventoryContext"

function ProtectedRoute({ children }) {
  const user = localStorage.getItem("si_current_user")
  // if (!user) return <Navigate to="/login" replace />
  return children
}

function App() {
  return (
    <SettingsProvider>
      <InventoryProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Auth pages */}
            <Route path="/login" element={<Login />} />
            {/* <Route path="/signup" element={<Signup />} /> */}

            {/* Protected pages inside Layout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="users" element={<Users />} />
              <Route path="transactions" element={<Transaction />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="alerts" element={<Alerts />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
            </Route>
              <Route path="/store" element={<Store />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </InventoryProvider>
    </SettingsProvider>
  )
}

export default App
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Verify from "./pages/Verify";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import RegisterProduct from "./pages/RegisterProduct";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ==================== */}
        {/* Public Pages */}
        {/* ==================== */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/verify"
          element={<Verify />}
        />

        <Route
          path="/products"
          element={<Products />}
        />

        <Route
          path="/product/:id"
          element={<ProductDetails />}
        />

        {/* ==================== */}
        {/* Authentication */}
        {/* ==================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        {/* ==================== */}
        {/* Admin Dashboard */}
        {/* ==================== */}

        <Route
          path="/dashboard/admin"
          element={<AdminDashboard />}
        />

        {/* ==================== */}
        {/* General Dashboard */}
        {/* ==================== */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* ==================== */}
        {/* Role Dashboards */}
        {/* ==================== */}

        <Route
          path="/dashboard/manufacturer"
          element={<Dashboard />}
        />

        <Route
          path="/dashboard/supplier"
          element={<Dashboard />}
        />

        <Route
          path="/dashboard/distributor"
          element={<Dashboard />}
        />

        <Route
          path="/dashboard/retailer"
          element={<Dashboard />}
        />

        <Route
          path="/dashboard/customer"
          element={<Dashboard />}
        />

        {/* ==================== */}
        {/* Manufacturer */}
        {/* ==================== */}

        <Route
          path="/dashboard/manufacturer/register-product"
          element={<RegisterProduct />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
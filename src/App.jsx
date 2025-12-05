import { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import OrdersList from "./pages/OrdersList";
import OrderDetails from "./pages/OrderDetails";
import LoginForm from "./pages/LoginForm";
import AdminOrderBidsRoute from "./routes/AdminOrderBidsRoute";
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import VendorsPage from "./pages/VendorPage";

function AppContent() {
  const [userName, setUserName] = useState(() => {
    try {
      return localStorage.getItem("userName") || null;
    } catch {
      return null;
    }
  });

  const location = useLocation();
  const currentPath = location.pathname;

  // List of valid routes (static + regex for dynamic ones)
  const validRoutes = [
    /^\/$/,                                // Home
    /^\/admin\/login$/,                    // Admin Login
    /^\/orderList$/,                       // Orders list
    /^\/vendors$/,                         // Vendors Page
    /^\/order\/[^/]+$/,                    // Order Details (dynamic)
    /^\/admin\/order\/[^/]+\/bids$/,       // Admin bids route (dynamic)
  ];

  const isValidRoute = validRoutes.some((route) => route.test(currentPath));

  // Hide navbar on Home page and on invalid route
  const hideNavbar = !isValidRoute || currentPath === "/";

  return (
    <>
      {!hideNavbar && <Navbar userName={userName} setUserName={setUserName} />}

      <ToastContainer position="top-center" autoClose={3000} pauseOnHover />

      <div className={hideNavbar ? "" : "p-6"}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin/login" element={<LoginForm setUserName={setUserName} />} />
          <Route path="/admin/order/:id/bids" element={<AdminOrderBidsRoute />} />
          <Route path="/orderList" element={<OrdersList />} />
          <Route path="/order/:id" element={<OrderDetails />} />
          <Route path="/vendors" element={<VendorsPage />} />

          {/* Handles all wrong routes */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

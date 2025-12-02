import { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import OrdersList from "./pages/OrdersList";
import OrderDetails from "./pages/OrderDetails";
import LoginForm from "./pages/LoginForm";
import AdminOrderBidsRoute from "./routes/AdminOrderBidsRoute";

export default function App() {
  // Initialize from localStorage so name persists across refreshes
  const [userName, setUserName] = useState(() => {
    try {
      return localStorage.getItem("userName") || null;
    } catch (e) {
      return null;
    }
  });

  return (
    <BrowserRouter>
      <Navbar userName={userName} setUserName={setUserName} />
      <ToastContainer position="top-center" autoClose={3000} pauseOnHover />
      <div className="p-6">
        <Routes>
          <Route
            path="/"
            element={<LoginForm setUserName={setUserName} />}
          />
          <Route
            path="/admin/login"
            element={<LoginForm setUserName={setUserName} />}
          />
          <Route path="/admin/order/:id/bids" element={<AdminOrderBidsRoute />} />
          <Route path="/orderList" element={<OrdersList />} />
          <Route path="/order/:id" element={<OrderDetails />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

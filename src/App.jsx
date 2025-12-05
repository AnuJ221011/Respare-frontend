import { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter, Routes, Route, useLocation, useMatches } from "react-router-dom";
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

  const [isNotFound, setIsNotFound] = useState(false);

  const location = useLocation();

  // Hide navbar on home + 404 page
  const hideNavbar = location.pathname === "/" || isNotFound;

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

          {/* Not Found */}
          <Route path="*" element={<NotFound setIsNotFound={setIsNotFound} />} />
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

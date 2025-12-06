import { useState, useMemo } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  matchRoutes,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import OrdersList from "./pages/OrdersList";
import OrderDetails from "./pages/OrderDetails";
import LoginForm from "./pages/LoginForm";
import AdminOrderBidsRoute from "./routes/AdminOrderBidsRoute";
import HomePage from "./pages/HomePage";
import VendorsPage from "./pages/VendorPage";
import NotFound from "./pages/NotFound";

function AppContent() {
  const [userName, setUserName] = useState(() => {
    try {
      return localStorage.getItem("userName") || null;
    } catch (e) {
      return null;
    }
  });

  const location = useLocation();
  const routeConfig = useMemo(
    () => [
      { path: "/", element: <HomePage />, hideNavbar: true },
      { path: "/admin/login", element: <LoginForm setUserName={setUserName} /> },
      { path: "/admin/order/:id/bids", element: <AdminOrderBidsRoute /> },
      { path: "/orderList", element: <OrdersList /> },
      { path: "/order/:id", element: <OrderDetails /> },
      { path: "/vendors", element: <VendorsPage /> },
      { path: "*", element: <NotFound />, hideNavbar: true },
    ],
    [setUserName]
  );

  const matchedRoutes = matchRoutes(routeConfig, location);
  const activeRoute =
    matchedRoutes && matchedRoutes.length > 0
      ? matchedRoutes[matchedRoutes.length - 1].route
      : null;

  const hideNavbar = activeRoute?.hideNavbar ?? false;

  return (
    <>
      {!hideNavbar && <Navbar userName={userName} setUserName={setUserName} />}

      <ToastContainer position="top-center" autoClose={3000} pauseOnHover />

      <div className={hideNavbar ? "" : "p-6"}>
        <Routes>
          {routeConfig.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
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

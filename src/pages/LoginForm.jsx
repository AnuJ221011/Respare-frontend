import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";


export default function LoginPage({ setUserName }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    console.log("Base URL:", BASE_URL);

    const loginUrl = `${BASE_URL}/api/auth/login`;

    try {
      const response = await fetch(loginUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });

      console.log("Status:", response.status);
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        // Pass username to parent state for NavBar and persist it for refresh
        console.log("response data:", data);
        console.log("customer name",data.customer.name);
        try {
          const name = data.customer?.name || "";
          if (typeof setUserName === "function") {
            setUserName(name);
          }
          if (name) localStorage.setItem("userName", name);
        } catch (e) {
          console.warn("Could not set username:", e);
        }
        // Show success toast, then navigate after toast closes so user sees feedback
        toast.success("Login successful!", {
          autoClose: 1500,
          onClose: () => navigate("/orderList"),
        });
      } else {
        console.log("Log from else block");
        setError(data.message || "Login failed");
        toast.error(data.message || "Login failed");
      }
    } catch (err) {
      console.log("Log from catch block");
      setError("Network error. Please try again.");
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-start justify-center pt-24 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-xs"
        >
          <form onSubmit={handleLogin} className="w-full max-w-xs mx-auto">
            <div className="grid gap-4">
              <input
                type="tel"
                placeholder="Enter Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                required
              />

              <input
                type="password"
                placeholder="Enter PIN"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full py-3 text-base bg-black hover:bg-black/90"
                isLoading={isSubmitting}
                disableWhileLoading
              >
                Login →
              </Button>

              {error && (
                <p className="text-red-600 text-xs text-center mt-2">{error}</p>
              )}

              <div className="text-center mt-2">
                <a href="#" className="text-xs text-blue-600 underline">
                  Facing Issue? Contact us
                </a>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </>
  );
}

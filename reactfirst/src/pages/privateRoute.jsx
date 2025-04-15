import { Navigate, Outlet, useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const PrivateRoute = () => {
  const token = localStorage.getItem("token");
  const userId = Number(localStorage.getItem("userId"));
  const userRole = localStorage.getItem("role"); // 'ngo' or 'supplier'
  const { id } = useParams();
  const location = useLocation(); // Get the full URL path
  const navigate = useNavigate();
  const [isVerified, setIsVerified] = useState(false);

  // ✅ Extract dashboard type from URL path
  const dashboardType = location.pathname.split("/")[1]; // 'dashboard-ngo' or 'dashboard-supplier'

  useEffect(() => {
    console.log("Checking authentication...");
    console.log("Token:", token);
    console.log("Stored User ID:", userId);
    console.log("URL ID:", id);
    console.log("User Role:", userRole);
    console.log("Dashboard Type:", dashboardType);

    if (!token) {
      console.log("No token found. Redirecting to login...");
      navigate("/login");
      return;
    }

    if (id && Number(id) !== userId) {

      navigate("/login");
      return;
    }

    if (userRole === "ngo" && dashboardType !== "dashboard-ngo") {
      console.log("NGO trying to access Supplier dashboard. Redirecting...");
      navigate("/login");
      return;
    }

    if (userRole === "supplier" && dashboardType !== "dashboard-supplier") {
      console.log("Supplier trying to access NGO dashboard. Redirecting...");
      navigate("/login");
      return;
    }

    console.log("User authenticated successfully!");
    setIsVerified(true);
  }, [id, userId, dashboardType, userRole, token, navigate]);

  // Prevent rendering until verification is done
  if (!isVerified) {
    return null; // OR a loading screen
  }

  return <Outlet />;
};

export default PrivateRoute;




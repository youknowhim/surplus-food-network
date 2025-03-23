
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/register";
import "./css/App.css";
import Dashboardngo from "./pages/dashboardngo";
import Dashboardsuppliers from "./pages/dashboardsuppliers";
import PrivateRoute from "./pages/PrivateRoute"; // Import PrivateRoute

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard-ngo" element={<Dashboardngo />} />
          <Route path="/dashboard-supplier" element={<Dashboardsuppliers />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;



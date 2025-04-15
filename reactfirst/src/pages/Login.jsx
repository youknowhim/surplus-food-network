import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Login.css";
import bgImage from "../assets/bgimage.webp";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("ngo");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.id);
        localStorage.setItem("role", data.role);

        if (data.role === "ngo") {
          navigate(`/dashboard-ngo/${data.id}`);
        } else if (data.role === "supplier") {
          navigate(`/dashboard-supplier/${data.id}`);
        } else {
          alert("Invalid role. Contact support.");
        }
      } else {
        alert(data.message || "Invalid email or password");
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Something went wrong. Try again later.");
    }
  };

  return (
    
    <div className="page-wrapper"> {/* Wrapper for full background */}
      <div className="container">
        <div className="image-section">
          <img src={bgImage} alt="Food Surplus and NGO Collaboration" />
        </div>

        <div className="form-section">
          <h2>{role === "ngo" ? "NGO Login" : "Supplier Login"}</h2>

          <div className="role-selection">
            <label>
              <input
                type="radio"
                name="role"
                value="ngo"
                checked={role === "ngo"}
                onChange={() => setRole("ngo")}
              />
              NGO
            </label>
            <label>
              <input
                type="radio"
                name="role"
                value="supplier"
                checked={role === "supplier"}
                onChange={() => setRole("supplier")}
              />
              Food Supplier
            </label>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit">Login</button>
          </form>

          <p className="register-link">
            New user? <span onClick={() => navigate("/register")}>Register</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;





import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Login.css";
import bgImage from "../assets/bgimage.webp";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("ngo"); // Default role is NGO
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log(`${role} Login successful!`);
        localStorage.setItem("token", data.token);
        localStorage.setItem("supplier_id", data.id);
        navigate(role === "ngo" ? "/dashboard-ngo" : "/dashboard-supplier");
      } else {
        alert(data.message || "Invalid email or password");
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Something went wrong. Try again later.");
    }
  };

  return (
    <div className="container">
      <div className="image-section">
        <img src={bgImage} alt="Food Surplus and NGO Collaboration" />
      </div>

      <div className="form-section">
        <h2>{role === "ngo" ? "NGO Login" : "Supplier Login"}</h2>

        {/* Role Selection */}
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
          {/* Email Field */}
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
              required
            />
          </div>

          {/* Password Field */}
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="off"
              required
            />
          </div>

          {/* Login Button */}
          <button type="submit">Login</button>
        </form>

        <p className="register-link">
          New user? <span onClick={() => navigate("/register")}>Register</span>
        </p>
      </div>
    </div>
  );
};

export default Login;




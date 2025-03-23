import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/register.css";
import bgImage from "../assets/bgimage.webp";

const Register = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("ngo"); // Default role is NGO
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, password, role }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log("Registration successful!");
        navigate("/login");
      } else {
        alert(data.message || "Registration failed. Try again.");
      }
    } catch (error) {
      console.error("Registration Error:", error);
      alert("Something went wrong. Try again later.");
    }
  };

  return (
    <div className="container">
      <div className="image-section">
        <img src={bgImage} alt="Food Surplus and NGO Collaboration" />
      </div>

      <div className="form-section">
        <h2>{role === "ngo" ? "Register as NGO" : "Register as Supplier"}</h2>

        <form onSubmit={handleSubmit}>
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

          {/* Name Field */}
          <div className="input-group">
            <label>Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Phone Number Field */}
          <div className="input-group">
            <label>Phone Number</label>
            <input
              type="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          {/* Email Field */}
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

          {/* Password Field */}
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

          {/* Register Button */}
          <button type="submit">Register</button>
        </form>

        <p className="register-link">
          Already have an account? <span onClick={() => navigate("/login")}>Login</span>
        </p>
      </div>
    </div>
  );
};

export default Register;



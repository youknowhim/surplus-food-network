import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/dashboard.css";

const Dashboardsuppliers = () => {
  const navigate = useNavigate();
  const [ngos, setNgos] = useState([]);
  const [foodName, setFoodName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [location, setLocation] = useState("");

  // Fetch NGOs looking for food
  // useEffect(() => {
  //   fetch("api/ngos")
  //     .then((res) => res.json())
  //     .then((data) => setNgos(data))
  //     .catch((error) => console.error("Error fetching NGOs:", error));
  // }, []);

  // Handle Logout
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Handle Adding Food
  const handleAddFood = () => {
    const supplier_id = Number(localStorage.getItem("supplier_id"));
    if (!supplier_id) {
      alert("Supplier ID missing! Please log in again.");
      console.error("Missing supplier_id in localStorage");
      return;
    }
    else{
      console.log(supplier_id);
    }
    const qty = Number(quantity);
    const token = localStorage.getItem("token");
    fetch("api/add-food", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // Send token in headers
      },
      body: JSON.stringify({ supplier_id, foodName, qty,imageUrl, location }),
    })
    
      .then((res) => res.json())
      .then((data) => alert(data.message))
      .catch((error) => console.error("Error adding food:", error));
  };

  return (
    <div>
      <h1>Supplier Dashboard</h1>
      <button onClick={handleLogout}>Logout</button>

      <h2>NGOs Looking for Food</h2>
      <ul>
        {ngos.map((ngo) => (
          <li key={ngo.id}>
            <strong>{ngo.name}</strong> - {ngo.location} - {ngo.phone}
          </li>
        ))}
      </ul>

      <h2>Add Food</h2>
   
      <input type="text" placeholder="Food Name" value={foodName} onChange={(e) => setFoodName(e.target.value)} />
      <input type="number" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
      <input type="text" placeholder="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
      <input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
      <button onClick={handleAddFood}>Add Food</button>
    </div>
  );
};

export default Dashboardsuppliers;

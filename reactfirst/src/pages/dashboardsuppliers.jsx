import { useEffect, useState } from "react";
import "../css/dashboardsupplier.css";

const DashboardSupplier = () => {
  const [supplier, setSupplier] = useState([{}]);
  const [ngos, setNgos] = useState([]);
  const [foodHistory, setFoodHistory] = useState([]);
  const [foodName, setFoodName] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [imageUrl, setImageUrl] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    fetch("/api/supplier-profile", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then((res) => res.json())
      .then((data) => setSupplier(data))
      .catch((error) => console.error("Error fetching supplier:", error));

    fetch("/api/fetch-requested", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then((res) => res.json())
      .then((data) => setNgos(data))
      .catch((error) => console.error("Error fetching NGO requests:", error));
  }, []);

  const handleAddFood = () => {
    fetch("/api/add-food", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ foodName, quantity, imageUrl, location })
    })
      .then((res) => res.json())
      .then((data) => alert(data.message))
      .catch((error) => console.error("Error adding food:", error));
  };

  const Approvefood = async(foodname, phonenumber, quantity) => {
    try {
      const response = await fetch("/api/approve-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ foodname, phonenumber, quantity }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      alert("Food request approved successfully Please refreash the page to get freash data!");
    }
    catch (error) {
      console.error("Error Approving request:", error);
      alert(error.message);
    }
  };

  useEffect(() => {
    fetch("/api/add-food-history", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }

    })
    .then((res) => res.json())
    .then((data) => setFoodHistory(data))
    .catch((err) => console.error("Error getting food history", err));
  }, []);
  

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <h1>Supplier Dashboard</h1>
        
        <section className="profile-section">
          <div className="profile-card">
            <div className="profile-card-header">
              <h2>Supplier Profile</h2>
            </div>
            <div className="profile-card-body">
              <div className="profile-detail">
                <span className="profile-label">ID:</span>
                <span className="profile-value">{supplier.id}</span>
              </div>
              <div className="profile-detail">
                <span className="profile-label">Name:</span>
                <span className="profile-value">{supplier.name}</span>
              </div>
              <div className="profile-detail">
                <span className="profile-label">Email:</span>
                <span className="profile-value">{supplier.email}</span>
              </div>
              <div className="profile-detail">
                <span className="profile-label">Phone:</span>
                <span className="profile-value">{supplier.phone}</span>
              </div>
            </div>
          </div>
        </section>
      </header>
      
      <section className="ngo-section">
        <div className="section-card">
          <div className="section-card-header">
            <h2>NGOs Requesting Food</h2>
          </div>
          <div className="section-card-body">
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>NGO Name</th>
                    <th>Food Requested</th>
                    <th>Contact</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {ngos.length > 0 ? (
                    ngos.map((ngorequest) => (
                      <tr key={ngorequest.id || Math.random()}>
                        <td>{ngorequest.ngo_name}</td>
                        <td>
                          <span className="quantity-pill">{ngorequest.quantity} kg</span> 
                          <span className="food-name">{ngorequest.food_name}</span>
                        </td>
                        <td>{ngorequest.requesting_ngoo_phone}</td>
                        <td>
                          <button 
                            className="approve-btn" 
                            onClick={() => Approvefood(ngorequest.food_name, ngorequest.requesting_ngoo_phone, ngorequest.quantity)}
                          >
                            Approve
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="empty-table-message">No NGO requests found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <div className="dashboard-grid">
        <section className="add-food-section">
          <div className="section-card">
            <div className="section-card-header">
              <h2>Add Food</h2>
            </div>
            <div className="section-card-body">
              <form className="add-food-form">
                <div className="form-group">
                  <label htmlFor="foodName">Food Name</label>
                  <input
                    id="foodName"
                    type="text"
                    placeholder="Food Name"
                    value={foodName}
                    onChange={(e) => setFoodName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="quantity">Quantity (kg)</label>
                  <input 
                    id="quantity"
                    type="number" 
                    placeholder="Quantity"
                    value={quantity} 
                    onChange={(e) => setQuantity(Number(e.target.value))} 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="imageUrl">Image URL</label>
                  <input
                    id="imageUrl"
                    type="text"
                    placeholder="Enter exact image URL"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input
                    id="location"
                    type="text"
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <button 
                  type="button" 
                  className="primary-btn"
                  onClick={handleAddFood}
                >
                  Add Food
                </button>
              </form>
            </div>
          </div>
        </section>

        <section className="history-section">
          <div className="section-card">
            <div className="section-card-header">
              <h2>Food Distribution History</h2>
            </div>
            <div className="section-card-body">
              {foodHistory.length > 0 && foodHistory[0].id ? (
                <ul className="history-list">
                  {foodHistory.map((addedfood) => (
                    <li key={addedfood.id} className="history-item">
                      <div className="history-item-content">
                        <h3 className="food-title">{addedfood.food_name}</h3>
                        <div className="history-item-details">
                          <span className="quantity-pill">{addedfood.quantity} units</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty-history-message">
                  <p>No food distribution history available</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default DashboardSupplier;



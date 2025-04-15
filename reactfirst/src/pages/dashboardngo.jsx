import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/dashboard.css"; // Updated CSS import

const Dashboardngo = () => {
  const [foodList, setFoodList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      alert("Unauthorized! Please log in.");
      navigate("/login");
      return;
    }

    fetchFoodList();
  }, [token, navigate]);

  const fetchFoodList = () => {
    setLoading(true);
    fetch("/api/available-food", {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 403) {
            alert("Session expired. Please log in again.");
            localStorage.removeItem("token");
            navigate("/login");
          }
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setFoodList(data);
        setLoading(false);
      })
      .catch((error) => {
        setError("Failed to fetch data. Please try again later.");
        setLoading(false);
      });
  };

  const requestFood = async (foodName, supplierId) => {
    try {
      const response = await fetch("/api/add-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ food_name: foodName, supplier_id: supplierId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Request failed");
      
      alert("Food request sent successfully!");
      fetchFoodList(); // Refresh list after successful request
    } catch (error) {
      alert(error.message);
    }
  };

  const filteredFoodList = foodList.filter(food => 
    food.food_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="dashboard-loading">
      <div className="loading-spinner"></div>
      <p>Loading available food...</p>
    </div>
  );

  if (error) return (
    <div className="dashboard-error">
      <div className="error-icon">⚠️</div>
      <p>{error}</p>
      <button className="retry-button" onClick={fetchFoodList}>Retry</button>
    </div>
  );

  return (
    <main className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Available Food Inventory</h1>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search food items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              
            />
            <button className="refresh-button" onClick={fetchFoodList} aria-label="Refresh list">
            ↻
          </button>
            
          </div>
          
        
      </header>
      
      {filteredFoodList.length === 0 ? (
        <div className="no-food-container">
          <div className="no-food-icon">🍽️</div>
          <p className="no-food">
            {searchTerm ? "No matching food items found." : "No food available at the moment."}
          </p>
          {searchTerm && (
            <button className="clear-filters-btn" onClick={() => setSearchTerm("")}>
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="food-count">Showing {filteredFoodList.length} food items</p>
          <div className="food-grid">
            {filteredFoodList.map((food) => (
              <article key={food.id || food.supplier_id} className="food-card">
                <div className="food-card-content">
                  <h2 className="food-name">{food.food_name}</h2>
                  <div className="food-details">
                    <div className="food-detail">
                      <span className="detail-label">Quantity:</span>
                      <span className="detail-value">{food.quantity} units</span>
                    </div>
                    <div className="food-detail">
                      <span className="detail-label">Supplier ID:</span>
                      <span className="detail-value">{food.supplier_id}</span>
                    </div>
                    {food.expiry_date && (
                      <div className="food-detail">
                        <span className="detail-label">Expires:</span>
                        <span className="detail-value">{new Date(food.expiry_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="food-card-actions">
                  <button 
                    className="request-btn" 
                    onClick={() => requestFood(food.food_name, food.supplier_id)}
                    aria-label={`Request ${food.food_name}`}
                  >
                    Request Food
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </main>
  );
};

export default Dashboardngo;









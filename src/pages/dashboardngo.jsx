import { useEffect, useState } from "react";

const Dashboardngo = () => {
  const [foodList, setFoodList] = useState([]);
  const token = localStorage.getItem("token");
  if(!token){
    alert('Please relogin , token expired');
  }
  useEffect(() => {
    fetch("/api/available-food", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`, // ✅ Add token in headers
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`); // ✅ Logs exact error
        }
        return res.json();
      })
      .then((data) => {
        console.log("Fetched data:", data); // ✅ Logs data to verify response
        setFoodList(data);
      })
      .catch((err) => console.error("Error fetching food data:", err));
  }, []);

  return (
    <div>
      <h2>Available Food</h2>
      <ul>
        {foodList.map((food) => (
          <li key={food.id}>
            {food.food_name} - {food.quantity} units
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboardngo;








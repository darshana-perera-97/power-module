// src/components/CebDataManager.jsx
import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:3020";

const CebDataManager = () => {
  const [cebData, setCebData] = useState({
    ranges: [],
    monthlyCost: [],
    unitPrice: [],
  });
  const [editedCost, setEditedCost] = useState([]);
  const [editedPrice, setEditedPrice] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/cebData`)
      .then((res) => res.json())
      .then((data) => {
        setCebData(data);
        setEditedCost(data.monthlyCost);
        setEditedPrice(data.unitPrice);
      })
      .catch((err) => {
        console.error("Error fetching CEB data:", err);
      });
  }, []);

  const handleCostChange = (index, value) => {
    const updated = [...editedCost];
    updated[index] = Number(value);
    setEditedCost(updated);
  };

  const handlePriceChange = (index, value) => {
    const updated = [...editedPrice];
    updated[index] = Number(value);
    setEditedPrice(updated);
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`${API_URL}/cebData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          monthlyCost: editedCost,
          unitPrice: editedPrice,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage("✅ CEB data updated successfully!");
        setCebData(result.cebData);
      } else {
        setMessage(`❌ Error: ${result.error}`);
      }
    } catch (err) {
      console.error("Failed to update:", err);
      setMessage("❌ Failed to update data");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>🔧 CEB Unit Rate Table</h2>
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Range</th>
            {cebData.ranges.map((range, index) => (
              <th key={index}>{range}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Monthly Cost</td>
            {editedCost.map((value, index) => (
              <td key={index}>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => handleCostChange(index, e.target.value)}
                  style={{ width: "60px" }}
                />
              </td>
            ))}
          </tr>
          <tr>
            <td>Unit Price</td>
            {editedPrice.map((value, index) => (
              <td key={index}>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => handlePriceChange(index, e.target.value)}
                  style={{ width: "60px" }}
                />
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      <button onClick={handleSubmit} style={{ marginTop: "20px" }}>
        Save Changes
      </button>

      {message && <p style={{ marginTop: "10px" }}>{message}</p>}
    </div>
  );
};

export default CebDataManager;

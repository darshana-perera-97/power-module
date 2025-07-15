import React, { useEffect, useState } from "react";
import { FiSettings, FiSave, FiAlertCircle, FiCheckCircle, FiDollarSign, FiZap } from "react-icons/fi";

const API_URL = "http://69.197.187.24:3020";

const CebDataManager = () => {
  const [cebData, setCebData] = useState({
    ranges: [],
    monthlyCost: [],
    unitPrice: [],
  });
  const [editedCost, setEditedCost] = useState([]);
  const [editedPrice, setEditedPrice] = useState([]);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle"); // idle | saving | success | error
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/cebData`);
        const data = await response.json();
        
        setCebData(data);
        setEditedCost(data.monthlyCost);
        setEditedPrice(data.unitPrice);
        setStatus("idle");
      } catch (err) {
        console.error("Error fetching CEB data:", err);
        setMessage("Failed to load CEB data. Please check your connection.");
        setStatus("error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
    setStatus("saving");
    setMessage("");
    try {
      const response = await fetch(`${API_URL}/cebData`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monthlyCost: editedCost, unitPrice: editedPrice }),
      });

      const result = await response.json();
      if (response.ok) {
        setCebData(result.cebData);
        setMessage("CEB data updated successfully!");
        setStatus("success");
      } else {
        setMessage(`Error: ${result.error}`);
        setStatus("error");
      }
    } catch (err) {
      console.error("Failed to update:", err);
      setMessage("Failed to update data. Please try again.");
      setStatus("error");
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <span className="loading-text">Loading CEB data...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <FiSettings style={{ color: 'var(--primary)', marginRight: 'var(--space-3)' }} />
            Unit Rate Configuration
          </div>
        </div>
        <div className="card-body">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th className="text-start fw-semibold">Type</th>
                  {cebData.ranges.map((range, idx) => (
                    <th key={idx} className="text-center">
                      <span className="badge" style={{ 
                        background: 'var(--primary)', 
                        color: 'var(--white)', 
                        padding: 'var(--space-1) var(--space-3)',
                        borderRadius: 'var(--radius-lg)',
                        fontSize: 'var(--font-size-sm)'
                      }}>{range}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="fw-semibold text-primary d-flex align-items-center">
                    <FiDollarSign className="me-2" />
                    Monthly Cost (Rs.)
                  </td>
                  {editedCost.map((value, idx) => (
                    <td key={idx} className="text-center">
                      <input
                        type="number"
                        className="form-input text-center"
                        value={value}
                        onChange={(e) => handleCostChange(idx, e.target.value)}
                        style={{ width: '100px', margin: '0 auto' }}
                        title="Enter monthly cost"
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="fw-semibold text-success d-flex align-items-center">
                    <FiZap className="me-2" />
                    Unit Price (Rs./kWh)
                  </td>
                  {editedPrice.map((value, idx) => (
                    <td key={idx} className="text-center">
                      <input
                        type="number"
                        className="form-input text-center"
                        value={value}
                        onChange={(e) => handlePriceChange(idx, e.target.value)}
                        style={{ width: '100px', margin: '0 auto' }}
                        title="Enter unit price"
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-end mt-4">
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={status === "saving"}
            >
              {status === "saving" ? (
                <>
                  <div className="spinner"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FiSave />
                  Save Changes
                </>
              )}
            </button>
          </div>

          {message && (
            <div className={`alert mt-4 ${
              status === "success" ? "alert-success" : "alert-error"
            }`}>
              {status === "success" ? <FiCheckCircle /> : <FiAlertCircle />}
              {message}
            </div>
          )}
        </div>
      </div>

      {/* Information Card */}
      <div className="card mt-4">
        <div className="card-header">
          <div className="card-title">
            <FiAlertCircle style={{ color: 'var(--warning)', marginRight: 'var(--space-3)' }} />
            How It Works
          </div>
        </div>
        <div className="card-body">
          <div className="stats-grid">
            <div>
              <h6 className="fw-semibold mb-3">Monthly Cost</h6>
              <p className="text-muted small">
                Fixed monthly charges applied regardless of usage. This covers basic service fees and infrastructure costs.
              </p>
            </div>
            <div>
              <h6 className="fw-semibold mb-3">Unit Price</h6>
              <p className="text-muted small">
                Variable cost per kilowatt-hour (kWh) consumed. Higher usage tiers typically have different rates.
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-4" style={{ 
            background: 'var(--gray-50)', 
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--gray-200)'
          }}>
            <h6 className="fw-semibold mb-2">Calculation Formula</h6>
            <p className="text-muted small mb-0">
              <strong>Total Cost = Monthly Cost + (Unit Price × Total Power Consumption)</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CebDataManager;

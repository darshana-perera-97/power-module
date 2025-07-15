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
      <div className="text-center py-5">
        <div className="spinner-modern mx-auto mb-3"></div>
        <p className="text-muted">Loading CEB data...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="dashboard-header">
        <h2 className="dashboard-title">
          <FiSettings className="me-3" style={{ color: 'var(--primary-color)' }} />
          CEB Rate Management
        </h2>
        <p className="dashboard-subtitle">
          Configure electricity rates and monthly costs for different usage ranges
        </p>
      </div>

      <div className="modern-card">
        <div className="modern-card-header">
          <FiSettings className="me-2" />
          Unit Rate Configuration
        </div>
        <div className="modern-card-body">
          <div className="table-responsive">
            <table className="table table-modern">
              <thead>
                <tr>
                  <th className="text-start fw-semibold">Type</th>
                  {cebData.ranges.map((range, idx) => (
                    <th key={idx} className="text-center">
                      <span className="badge bg-primary rounded-pill">{range}</span>
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
                        className="form-control-modern text-center"
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
                        className="form-control-modern text-center"
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
              className="btn-modern btn-modern-success"
              onClick={handleSubmit}
              disabled={status === "saving"}
            >
              {status === "saving" ? (
                <>
                  <div className="spinner-modern"></div>
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
            <div className={`alert-modern mt-4 ${
              status === "success" ? "alert-modern-success" : "alert-modern-danger"
            }`}>
              {status === "success" ? <FiCheckCircle /> : <FiAlertCircle />}
              {message}
            </div>
          )}
        </div>
      </div>

      {/* Information Card */}
      <div className="modern-card mt-4">
        <div className="modern-card-header">
          <FiAlertCircle className="me-2" />
          How It Works
        </div>
        <div className="modern-card-body">
          <div className="row">
            <div className="col-md-6">
              <h6 className="fw-semibold mb-3">Monthly Cost</h6>
              <p className="text-muted small">
                Fixed monthly charges for each usage range. This is the base cost regardless of consumption.
              </p>
            </div>
            <div className="col-md-6">
              <h6 className="fw-semibold mb-3">Unit Price</h6>
              <p className="text-muted small">
                Cost per kilowatt-hour (kWh) for electricity consumed within each range.
              </p>
            </div>
          </div>
          <div className="mt-3 p-3 bg-light rounded">
            <strong>Formula:</strong> Total Cost = Monthly Cost + (Total Power × Unit Price)
          </div>
        </div>
      </div>
    </div>
  );
};

export default CebDataManager;

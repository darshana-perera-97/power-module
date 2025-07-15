import React, { useEffect, useState } from "react";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";

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
        setMessage("❌ Error loading data.");
        setStatus("error");
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
        setMessage("✅ CEB data updated successfully!");
        setStatus("success");
      } else {
        setMessage(`❌ Error: ${result.error}`);
        setStatus("error");
      }
    } catch (err) {
      console.error("Failed to update:", err);
      setMessage("❌ Failed to update data.");
      setStatus("error");
    }
  };

  return (
    <div className="container mt-4">
      <h4 className="mb-3 fw-semibold">🔧 CEB Unit Rate Table</h4>

      <div className="ceb-table-container">
        <Table
          striped={false}
          bordered
          hover={false}
          responsive
          className="ceb-table align-middle"
        >
          <thead>
            <tr>
              <th className="text-start">Type</th>
              {cebData.ranges.map((range, idx) => (
                <th key={idx} className="text-center">
                  {range}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="fw-semibold text-primary">Monthly Cost</td>
              {editedCost.map((value, idx) => (
                <td key={idx} className="text-center">
                  <Form.Control
                    type="number"
                    size="sm"
                    value={value}
                    onChange={(e) => handleCostChange(idx, e.target.value)}
                    className="text-center border-0"
                    title="Enter monthly cost"
                  />
                </td>
              ))}
            </tr>
            <tr>
              <td className="fw-semibold text-success">Unit Price</td>
              {editedPrice.map((value, idx) => (
                <td key={idx} className="text-center">
                  <Form.Control
                    type="number"
                    size="sm"
                    value={value}
                    onChange={(e) => handlePriceChange(idx, e.target.value)}
                    className="text-center border-0"
                    title="Enter unit price"
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </Table>
      </div>

      <div className="d-flex justify-content-end">
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={status === "saving"}
        >
          {status === "saving" ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>

      {message && (
        <Alert variant={status === "success" ? "success" : "danger"} className="mt-3">
          {message}
        </Alert>
      )}
    </div>
  );
};

export default CebDataManager;

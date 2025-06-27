import { useEffect, useState } from "react";
import { fetchDeviceKeys } from "../api";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import { BsArrowRepeat } from "react-icons/bs";

export default function DeviceSelector({ onDeviceSelect }) {
  const [devices, setDevices] = useState([]);
  const [selected, setSelected] = useState(
    localStorage.getItem("selectedDevice") || ""
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDevices = async () => {
    setLoading(true);
    setError(null);
    try {
      const keys = await fetchDeviceKeys();
      setDevices(keys);
    } catch (err) {
      setError(err.message || "Failed to fetch devices.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selected) {
      onDeviceSelect(selected);
      return;
    }
    loadDevices();
    // eslint-disable-next-line
  }, [selected]);

  const handleSelect = (value) => {
    localStorage.setItem("selectedDevice", value);
    setSelected(value);
    onDeviceSelect(value);
  };

  if (selected) return null;

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
      <Card className="border-0 shadow-sm" style={{ minWidth: 320, maxWidth: 380 }}>
        <Card.Body>
          <h5 className="mb-3 text-center fw-semibold">Select a Device</h5>
          <p className="text-muted small text-center mb-4">
            Choose a device to start monitoring your smart power meter.
          </p>

          {loading ? (
            <div className="d-flex align-items-center justify-content-center my-3">
              <Spinner animation="border" size="sm" className="me-2" />
              <span className="text-muted">Loading...</span>
            </div>
          ) : error ? (
            <div className="alert alert-light border-danger text-danger small">
              {error}
              <div className="text-end mt-2">
                <Button variant="outline-danger" size="sm" onClick={loadDevices}>
                  <BsArrowRepeat className="me-1" />
                  Retry
                </Button>
              </div>
            </div>
          ) : devices.length === 0 ? (
            <div className="text-center text-muted small">
              No devices found.
              <div className="mt-2">
                <Button variant="outline-secondary" size="sm" onClick={loadDevices}>
                  <BsArrowRepeat className="me-1" />
                  Refresh
                </Button>
              </div>
            </div>
          ) : (
            <Form>
              <Form.Group controlId="deviceSelect">
                <Form.Select
                  defaultValue=""
                  onChange={(e) => handleSelect(e.target.value)}
                  aria-label="Select device"
                  className="mb-3"
                >
                  <option value="" disabled>
                    -- Choose a Device --
                  </option>
                  {devices.map((key) => (
                    <option key={key} value={key}>
                      {key}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <div className="d-flex justify-content-end">
                <Button variant="outline-primary" size="sm" onClick={loadDevices}>
                  <BsArrowRepeat className="me-1" />
                  Refresh List
                </Button>
              </div>
            </Form>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

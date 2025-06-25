import { useEffect, useState } from "react";
import { fetchDeviceKeys } from "../api";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import { BsFillLightningFill, BsArrowRepeat } from "react-icons/bs";

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
      setError(err.message || "Unknown error");
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
      <Card className="shadow" style={{ minWidth: 350, maxWidth: 400 }}>
        <Card.Header style={{ background: "#0077b5" }}>
          <span className="text-white fw-bold">
            <BsFillLightningFill className="me-2" />Select a Device
          </span>
        </Card.Header>
        <Card.Body>
          <p className="mb-3 text-muted">Choose your smart power meter device to view its status and history.</p>
          {loading ? (
            <div className="d-flex align-items-center justify-content-center my-3">
              <Spinner animation="border" variant="primary" size="sm" className="me-2" />
              Loading devices…
            </div>
          ) : error ? (
            <div className="alert alert-danger py-1">{error}</div>
          ) : devices.length === 0 ? (
            <div className="text-center text-muted">
              <em>No devices found.</em>
              <Button variant="outline-primary" size="sm" className="ms-2" onClick={loadDevices}>
                <BsArrowRepeat /> Refresh
              </Button>
            </div>
          ) : (
            <Form>
              <Form.Group controlId="deviceSelect">
                <Form.Label className="fw-semibold">Device List</Form.Label>
                <Form.Select
                  defaultValue=""
                  onChange={e => handleSelect(e.target.value)}
                  aria-label="Select device"
                >
                  <option value="" disabled>
                    -- Choose Device --
                  </option>
                  {devices.map((key) => (
                    <option key={key} value={key}>
                      {key}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <div className="d-flex justify-content-end mt-3">
                <Button variant="outline-primary" size="sm" onClick={loadDevices}>
                  <BsArrowRepeat className="me-1" />Refresh List
                </Button>
              </div>
            </Form>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

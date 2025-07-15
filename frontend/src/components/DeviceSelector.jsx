import { useEffect, useState } from "react";
import { fetchDeviceKeys } from "../api";
import { FiZap, FiRefreshCw, FiAlertCircle, FiCheckCircle } from "react-icons/fi";

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
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">
            <FiZap size={32} />
          </div>
          <h2 className="auth-title">Select Your Device</h2>
          <p className="auth-subtitle">
            Choose a device to start monitoring your smart power meter
          </p>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <span className="loading-text">Loading available devices...</span>
          </div>
        ) : error ? (
          <div className="alert alert-error">
            <FiAlertCircle />
            <div>
              <strong>Connection Error</strong>
              <p className="mb-0 mt-0">{error}</p>
            </div>
          </div>
        ) : devices.length === 0 ? (
          <div className="text-center">
            <div className="auth-icon" style={{ background: 'var(--gray-200)', color: 'var(--gray-500)' }}>
              <FiAlertCircle size={24} />
            </div>
            <h5 className="text-muted mb-2">No Devices Found</h5>
            <p className="text-muted mb-4">No power meter devices are currently available.</p>
            <button 
              className="btn btn-secondary"
              onClick={loadDevices}
            >
              <FiRefreshCw />
              Refresh
            </button>
          </div>
        ) : (
          <div className="auth-form">
            <div className="form-group">
              <label className="form-label">
                <FiZap className="form-icon" />
                Available Devices
              </label>
              <select
                className="form-input"
                onChange={(e) => handleSelect(e.target.value)}
                defaultValue=""
              >
                <option value="" disabled>
                  -- Choose a Device --
                </option>
                {devices.map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2 text-muted">
                <FiCheckCircle size={16} />
                <small>{devices.length} device{devices.length !== 1 ? 's' : ''} available</small>
              </div>
              
              <button 
                className="btn btn-secondary"
                onClick={loadDevices}
              >
                <FiRefreshCw />
                Refresh List
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

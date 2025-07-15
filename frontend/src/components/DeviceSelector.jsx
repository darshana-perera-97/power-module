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
    <div className="min-vh-100 d-flex align-items-center justify-content-center">
      <div className="form-modern" style={{ maxWidth: '500px', width: '100%' }}>
        <div className="text-center mb-5">
          <div className="d-inline-flex align-items-center justify-content-center mb-4" style={{ 
            width: '80px', 
            height: '80px', 
            background: 'linear-gradient(135deg, var(--primary-color), var(--primary-dark))',
            borderRadius: 'var(--radius-xl)',
            color: 'var(--white)'
          }}>
            <FiZap size={32} />
          </div>
          <h2 className="dashboard-title mb-3">Select Your Device</h2>
          <p className="dashboard-subtitle">
            Choose a device to start monitoring your smart power meter
          </p>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-modern mx-auto mb-3"></div>
            <p className="text-muted">Loading available devices...</p>
          </div>
        ) : error ? (
          <div className="alert-modern alert-modern-danger mb-4">
            <FiAlertCircle />
            <div>
              <strong>Connection Error</strong>
              <p className="mb-0 mt-1">{error}</p>
            </div>
          </div>
        ) : devices.length === 0 ? (
          <div className="text-center py-5">
            <div className="d-inline-flex align-items-center justify-content-center mb-3" style={{ 
              width: '60px', 
              height: '60px', 
              background: 'var(--gray-200)',
              borderRadius: 'var(--radius-lg)',
              color: 'var(--gray-500)'
            }}>
              <FiAlertCircle size={24} />
            </div>
            <h5 className="text-muted mb-2">No Devices Found</h5>
            <p className="text-muted mb-4">No power meter devices are currently available.</p>
            <button 
              className="btn-modern btn-modern-secondary"
              onClick={loadDevices}
            >
              <FiRefreshCw />
              Refresh
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <label className="form-label fw-semibold text-muted mb-3">
                <FiZap className="me-2" />
                Available Devices
              </label>
              <select
                className="form-control-modern w-100"
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
                className="btn-modern btn-modern-secondary"
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

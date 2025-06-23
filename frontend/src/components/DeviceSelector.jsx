import { useEffect, useState } from "react";
import { fetchDeviceKeys } from "../api";

export default function DeviceSelector({ onDeviceSelect }) {
  const [devices, setDevices] = useState([]);
  const [selected, setSelected] = useState(
    localStorage.getItem("selectedDevice") || ""
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selected) {
      onDeviceSelect(selected);
      return;
    }

    let cancel = false;

    const load = async () => {
      try {
        const keys = await fetchDeviceKeys();
        if (!cancel) setDevices(keys);
      } catch (err) {
        if (!cancel) setError(err.message || "Unknown error");
      } finally {
        if (!cancel) setLoading(false);
      }
    };

    load();
    return () => {
      cancel = true;
    };
  }, [selected]);

  const handleSelect = (value) => {
    localStorage.setItem("selectedDevice", value);
    setSelected(value);
    onDeviceSelect(value);
  };

  if (selected) return null;

  if (loading) return <p>Loading devices…</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <div>
      <h2>Select a Device</h2>
      {devices.length === 0 ? (
        <em>No devices found.</em>
      ) : (
        <select defaultValue="" onChange={(e) => handleSelect(e.target.value)}>
          <option value="" disabled>
            -- Choose Device --
          </option>
          {devices.map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

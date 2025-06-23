import { useEffect, useState } from "react";
import { fetchDeviceState } from "../api";

export default function DeviceStateViewer({ deviceId }) {
  const [deviceData, setDeviceData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancel = false;

    const load = async () => {
      try {
        const res = await fetchDeviceState(deviceId);
        if (!cancel) setDeviceData(res);
      } catch (err) {
        if (!cancel) setError(err.message);
      }
    };

    load();
    const interval = setInterval(load, 3000);

    return () => {
      cancel = true;
      clearInterval(interval);
    };
  }, [deviceId]);

  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (!deviceData) return <p>Loading device data…</p>;

  const { data, time, deviceStatus } = deviceData;

  return (
    <div>
      <h3>🔍 Device: {deviceId}</h3>
      <p>Status: {deviceStatus ? "🟢 Active" : "🔴 Inactive"}</p>
      <p>Last Updated: {time}</p>

      <ul>
        {Object.entries(data).map(([key, value]) => (
          <li key={key}>
            <strong>{key}</strong>:{" "}
            {typeof value === "object" ? JSON.stringify(value) : value}
          </li>
        ))}
      </ul>
      
    </div>
  );
}

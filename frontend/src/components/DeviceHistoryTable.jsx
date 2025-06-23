import { useEffect, useState } from "react";
import { fetchDeviceHistory } from "../api";

export default function DeviceHistoryTable({ deviceId }) {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancel = false;

    const load = async () => {
      try {
        const res = await fetchDeviceHistory(deviceId);
        if (!cancel) setHistory(res);
      } catch (err) {
        if (!cancel) setError(err.message);
      }
    };

    load();
  }, [deviceId]);

  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (!history.length)
    return <p>No historical data found for device {deviceId}</p>;

  return (
    <div>
      <h3>📊 History of Device {deviceId}</h3>
      <table
        border="1"
        cellPadding="5"
        style={{ width: "100%", marginTop: "10px" }}
      >
        <thead>
          <tr>
            <th>Time</th>
            <th>Status</th>
            <th>Battery</th>
            <th>Current</th>
            <th>Live Power</th>
            <th>Total Power</th>
            <th>Voltage</th>
          </tr>
        </thead>
        <tbody>
          {history.map((row, i) => (
            <tr key={i}>
              <td>{row.time}</td>
              <td>{row.deviceStatus ? "🟢 Live" : "🔴 Inactive"}</td>
              <td>{row.battery}</td>
              <td>{row.current}</td>
              <td>{row.livepower}</td>
              <td>{row.totalpower}</td>
              <td>{row.voltage}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

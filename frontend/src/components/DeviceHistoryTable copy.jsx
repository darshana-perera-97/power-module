import { useEffect, useState } from "react";
import { fetchDeviceHistory } from "../api";
import Table from 'react-bootstrap/Table';

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
      <Table striped bordered hover responsive className="mt-2">
        <thead>
          <tr>
            <th>Time</th>
            <th>Status</th>
            <th>Battery</th>
            <th>Current</th>
            <th>Live Power</th>
            <th>Total Power</th>
            <th>Voltage</th>
            <th>cost</th>
          </tr>
        </thead>
        <tbody>
          {history.map((row, i) => (
            <tr key={i}>
              <td>{row.time}</td>
              <td>{row.deviceStatus ? <span className="text-success">🟢 Live</span> : <span className="text-danger">🔴 Inactive</span>}</td>
              <td>{row.battery}</td>
              <td>{row.current}</td>
              <td>{row.livepower}</td>
              <td>{row.totalpower}</td>
              <td>{row.voltage}</td>
              <td>{row.calculatedCost}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

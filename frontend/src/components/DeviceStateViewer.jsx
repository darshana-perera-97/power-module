import { useEffect, useState } from "react";
import { fetchDeviceState } from "../api";

export default function DeviceStateViewer({ deviceId }) {
  const [deviceData, setDeviceData] = useState(null);
  const [cebData, setCebData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancel = false;

    const load = async () => {
      try {
        const res = await fetchDeviceState(deviceId);
        const ceb = await fetch("http://localhost:3020/cebData").then((r) =>
          r.json()
        );

        if (!cancel) {
          setDeviceData(res);
          setCebData(ceb);
        }
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
  if (!deviceData || !cebData) return <p>Loading device data…</p>;

  const { data, time, deviceStatus } = deviceData;
  const { totalpower } = data;

  // 🔢 Cost calculation logic with fallback for >250 units
  const power = Number(totalpower);
  let cost = 0;
  let rangeUsed = "";
  let found = false;

  for (let i = 0; i < cebData.ranges.length; i++) {
    const [min, max] = cebData.ranges[i].split("-").map(Number);
    if (power >= min && power <= max) {
      const fixed = cebData.monthlyCost[i];
      const unit = cebData.unitPrice[i];
      cost = fixed + unit * power;
      rangeUsed = cebData.ranges[i];
      found = true;
      break;
    }
  }

  // If power > all defined ranges, fallback to last range
  if (!found && cebData.ranges.length > 0) {
    const lastIndex = cebData.ranges.length - 1;
    const fixed = cebData.monthlyCost[lastIndex];
    const unit = cebData.unitPrice[lastIndex];
    cost = fixed + unit * power;
    rangeUsed = cebData.ranges[lastIndex] + " (used for > max)";
  }

  return (
    <div
      style={{ padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}
    >
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

      <h4>💰 Estimated Cost: Rs. {cost.toFixed(2)}</h4>
      <p>
        🔢 Applied Range: <strong>{rangeUsed}</strong>
      </p>
    </div>
  );
}

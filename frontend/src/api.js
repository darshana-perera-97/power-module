const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://69.197.187.24:3020";

export async function fetchDeviceKeys() {
  const res = await fetch(`${API_BASE}/devices`);
  if (!res.ok) throw new Error("Failed to fetch device keys");
  return res.json();
}

export async function fetchDeviceState(deviceId) {
  const res = await fetch(`${API_BASE}/currentState?device=${deviceId}`);
  if (!res.ok) throw new Error("Failed to fetch current state");
  return res.json();
}

export async function fetchDeviceHistory(deviceId) {
  const res = await fetch(`${API_BASE}/pastData?device=${deviceId}`);
  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
}

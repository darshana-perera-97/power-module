import { useEffect, useState } from "react";
import { fetchDeviceHistory } from "../api";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

const linkedinBlue = '#0077b5';

export default function DeviceHistoryTable({ deviceId }) {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancel = false;
    let interval;

    const load = async () => {
      try {
        const res = await fetchDeviceHistory(deviceId);
        if (!cancel) setHistory(res);
      } catch (err) {
        if (!cancel) setError(err.message);
      }
    };

    load();
    interval = setInterval(load, 30000); // 15 seconds

    return () => {
      cancel = true;
      clearInterval(interval);
    };
  }, [deviceId]);

  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (!history.length)
    return <p>No historical data found for device {deviceId}</p>;

  // Prepare data for charts
  const chartData = history.map(row => ({
    time: row.time,
    status: row.deviceStatus ? 1 : 0,
    battery: row.battery,
    current: row.current,
    livepower: row.livepower,
    totalpower: row.totalpower,
    voltage: row.voltage,
    cost: row.calculatedCost,
  }));

  const chartStyle = { background: '#fff', border: `1px solid ${linkedinBlue}`, borderRadius: 10, padding: 10 };

  return (
    <div>
      <h3>📊 History of Device {deviceId}</h3>
      {/* Graphs */}
      <div className="mb-4">
        <Row className="g-3">
          <Col md={4} xs={12}>
            <div style={chartStyle}>
              <div className="fw-bold mb-2" style={{ color: linkedinBlue }}>Device Status</div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey="time" hide />
                  <YAxis domain={[0, 1]} ticks={[0, 1]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="status" stroke={linkedinBlue} dot={false} name="Status (1=Live)" />
                  <CartesianGrid strokeDasharray="3 3" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Col>
          <Col md={4} xs={12}>
            <div style={chartStyle}>
              <div className="fw-bold mb-2" style={{ color: linkedinBlue }}>Battery</div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey="time" hide />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="battery" stroke={linkedinBlue} dot={false} name="Battery" />
                  <CartesianGrid strokeDasharray="3 3" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Col>
          <Col md={4} xs={12}>
            <div style={chartStyle}>
              <div className="fw-bold mb-2" style={{ color: linkedinBlue }}>Current</div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey="time" hide />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="current" stroke={linkedinBlue} dot={false} name="Current" />
                  <CartesianGrid strokeDasharray="3 3" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Col>
        </Row>
        <Row className="g-3 mt-1">
          <Col md={4} xs={12}>
            <div style={chartStyle}>
              <div className="fw-bold mb-2" style={{ color: linkedinBlue }}>Live Power</div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey="time" hide />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="livepower" stroke={linkedinBlue} dot={false} name="Live Power" />
                  <CartesianGrid strokeDasharray="3 3" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Col>
          <Col md={4} xs={12}>
            <div style={chartStyle}>
              <div className="fw-bold mb-2" style={{ color: linkedinBlue }}>Total Power</div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey="time" hide />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="totalpower" stroke={linkedinBlue} dot={false} name="Total Power" />
                  <CartesianGrid strokeDasharray="3 3" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Col>
          <Col md={4} xs={12}>
            <div style={chartStyle}>
              <div className="fw-bold mb-2" style={{ color: linkedinBlue }}>Cost</div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey="time" hide />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="cost" stroke={linkedinBlue} dot={false} name="Cost" />
                  <CartesianGrid strokeDasharray="3 3" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}

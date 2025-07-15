import { useEffect, useState } from "react";
import { fetchDeviceState } from "../api";
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

export default function DeviceStateViewer({ deviceId }) {
  const [deviceData, setDeviceData] = useState(null);
  const [cebData, setCebData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancel = false;

    const load = async () => {
      try {
        const res = await fetchDeviceState(deviceId);
        const ceb = await fetch("http://69.197.187.24:3020/cebData").then((r) =>
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
  const { totalpower, livepower, battery, current, voltage } = data;

  // Cost calculation logic
  const power = Number(totalpower);
  let cost = 0;
  let found = false;
  for (let i = 0; i < cebData.ranges.length; i++) {
    const [min, max] = cebData.ranges[i].split("-").map(Number);
    if (power >= min && power <= max) {
      const fixed = cebData.monthlyCost[i];
      const unit = cebData.unitPrice[i];
      cost = fixed + unit * power;
      found = true;
      break;
    }
  }
  if (!found && cebData.ranges.length > 0) {
    const lastIndex = cebData.ranges.length - 1;
    const fixed = cebData.monthlyCost[lastIndex];
    const unit = cebData.unitPrice[lastIndex];
    cost = fixed + unit * power;
  }

  // LinkedIn color
  const linkedinBlue = '#0077b5';
  const cardStyle = { border: `1px solid ${linkedinBlue}`, borderRadius: 10, minHeight: 90 };
  const headerStyle = { background: linkedinBlue, color: 'white', borderTopLeftRadius: 10, borderTopRightRadius: 10, fontWeight: 600, fontSize: 16 };
  const valueStyle = { fontWeight: 600, fontSize: 22, color: linkedinBlue };

  return (
    <div className="container mb-4">
      {/* Usage Data */}
      <div className="mb-3">
        <div className="mb-2 fw-bold" style={{ color: linkedinBlue }}>Usage Data</div>
        <Row xs={1} md={3} className="g-3">
          <Col>
            <Card style={cardStyle} className="h-100">
              <Card.Body>
                <div className="text-muted">Estimated Cost</div>
                <div style={valueStyle}>Rs. {cost.toFixed(2)}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card style={cardStyle} className="h-100">
              <Card.Body>
                <div className="text-muted">Live Power</div>
                <div style={valueStyle}>{livepower}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card style={cardStyle} className="h-100">
              <Card.Body>
                <div className="text-muted">Total Power</div>
                <div style={valueStyle}>{totalpower}</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
      {/* Device Status */}
      <div className="mb-3">
        <div className="mb-2 fw-bold" style={{ color: linkedinBlue }}>Device Status</div>
        <Row xs={1} md={3} className="g-3">
          <Col>
            <Card style={cardStyle} className="h-100">
              <Card.Body>
                <div className="text-muted">Status</div>
                <div style={valueStyle}>{deviceStatus ? <span className="text-success">🟢 Active</span> : <span className="text-danger">🔴 Inactive</span>}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card style={cardStyle} className="h-100">
              <Card.Body>
                <div className="text-muted">Device</div>
                <div style={valueStyle}>{deviceId}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card style={cardStyle} className="h-100">
              <Card.Body>
                <div className="text-muted">Battery</div>
                <div style={valueStyle}>{battery}</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
      {/* Other Measurements */}
      <div className="mb-3">
        <div className="mb-2 fw-bold" style={{ color: linkedinBlue }}>Other Measurements</div>
        <Row xs={1} md={3} className="g-3">
          <Col>
            <Card style={cardStyle} className="h-100">
              <Card.Body>
                <div className="text-muted">Current</div>
                <div style={valueStyle}>{current}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card style={cardStyle} className="h-100">
              <Card.Body>
                <div className="text-muted">Voltage</div>
                <div style={valueStyle}>{voltage}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card style={cardStyle} className="h-100">
              <Card.Body>
                <div className="text-muted">Last Updated</div>
                <div style={{ ...valueStyle, fontSize: 14 }}>{time}</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { fetchDeviceHistory } from "../api";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { FiTrendingUp, FiBattery, FiZap, FiActivity, FiDollarSign, FiCheckCircle } from "react-icons/fi";

export default function DeviceHistoryTable({ deviceId }) {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    let interval;

    const load = async () => {
      try {
        setLoading(true);
        const res = await fetchDeviceHistory(deviceId);
        if (!cancel) {
          setHistory(res);
          setError(null);
        }
      } catch (err) {
        if (!cancel) {
          setError(err.message);
        }
      } finally {
        if (!cancel) {
          setLoading(false);
        }
      }
    };

    load();
    interval = setInterval(load, 30000); // 30 seconds

    return () => {
      cancel = true;
      clearInterval(interval);
    };
  }, [deviceId]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-modern mx-auto mb-3"></div>
        <p className="text-muted">Loading historical data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert-modern alert-modern-danger">
        <FiTrendingUp />
        <strong>Error:</strong> {error}
      </div>
    );
  }

  if (!history.length) {
    return (
      <div className="text-center py-5">
        <div className="d-inline-flex align-items-center justify-content-center mb-3" style={{ 
          width: '60px', 
          height: '60px', 
          background: 'var(--gray-200)',
          borderRadius: 'var(--radius-lg)',
          color: 'var(--gray-500)'
        }}>
          <FiTrendingUp size={24} />
        </div>
        <h5 className="text-muted mb-2">No Historical Data</h5>
        <p className="text-muted">No historical data found for device {deviceId}</p>
      </div>
    );
  }

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

  const chartConfigs = [
    {
      title: "Device Status",
      icon: FiCheckCircle,
      dataKey: "status",
      color: "var(--success-color)",
      yDomain: [0, 1],
      yTicks: [0, 1],
      unit: "Online/Offline"
    },
    {
      title: "Battery Level",
      icon: FiBattery,
      dataKey: "battery",
      color: "var(--warning-color)",
      unit: "%"
    },
    {
      title: "Current",
      icon: FiZap,
      dataKey: "current",
      color: "var(--info-color)",
      unit: "A"
    },
    {
      title: "Live Power",
      icon: FiActivity,
      dataKey: "livepower",
      color: "var(--primary-color)",
      unit: "kW"
    },
    {
      title: "Total Power",
      icon: FiTrendingUp,
      dataKey: "totalpower",
      color: "var(--secondary-color)",
      unit: "kWh"
    },
    {
      title: "Cost",
      icon: FiDollarSign,
      dataKey: "cost",
      color: "var(--success-color)",
      unit: "Rs."
    }
  ];

  return (
    <div>
      <div className="dashboard-header">
        <h2 className="dashboard-title">
          <FiTrendingUp className="me-3" style={{ color: 'var(--primary-color)' }} />
          Historical Data
        </h2>
        <p className="dashboard-subtitle">
          Performance trends and usage patterns for device {deviceId}
        </p>
      </div>

      <div className="grid-modern grid-modern-3">
        {chartConfigs.map((config, index) => {
          const IconComponent = config.icon;
          return (
            <div key={index} className="chart-container">
              <div className="chart-title">
                <IconComponent size={20} style={{ color: config.color }} />
                {config.title}
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart 
                  data={chartData} 
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <XAxis 
                    dataKey="time" 
                    hide 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    domain={config.yDomain || ['auto', 'auto']}
                    ticks={config.yTicks}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => config.yTicks ? (value === 1 ? 'Online' : 'Offline') : value}
                  />
                  <Tooltip 
                    contentStyle={{
                      background: 'var(--white)',
                      border: '1px solid var(--gray-200)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-lg)'
                    }}
                    labelStyle={{ fontWeight: 600, color: 'var(--gray-700)' }}
                    formatter={(value, name) => [
                      config.yTicks ? (value === 1 ? 'Online' : 'Offline') : `${value} ${config.unit}`,
                      config.title
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey={config.dataKey} 
                    stroke={config.color}
                    strokeWidth={2}
                    dot={false}
                    name={config.title}
                  />
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="var(--gray-200)"
                    opacity={0.5}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          );
        })}
      </div>

      {/* Data Summary */}
      <div className="mt-5">
        <div className="modern-card">
          <div className="modern-card-header">
            <FiTrendingUp className="me-2" />
            Data Summary
          </div>
          <div className="modern-card-body">
            <div className="grid-modern grid-modern-4">
              <div className="text-center">
                <div className="fw-bold text-primary">{history.length}</div>
                <div className="text-muted small">Total Records</div>
              </div>
              <div className="text-center">
                <div className="fw-bold text-success">
                  {history.filter(h => h.deviceStatus).length}
                </div>
                <div className="text-muted small">Active Sessions</div>
              </div>
              <div className="text-center">
                <div className="fw-bold text-info">
                  {Math.max(...history.map(h => h.totalpower)).toFixed(2)}
                </div>
                <div className="text-muted small">Peak Power (kWh)</div>
              </div>
              <div className="text-center">
                <div className="fw-bold text-warning">
                  {Math.max(...history.map(h => h.calculatedCost || 0)).toFixed(2)}
                </div>
                <div className="text-muted small">Max Cost (Rs.)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

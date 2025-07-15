import { useEffect, useState } from "react";
import { fetchDeviceState } from "../api";
import { FiDollarSign, FiZap, FiBattery, FiActivity, FiClock, FiCheckCircle, FiXCircle } from "react-icons/fi";

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

  if (error) {
    return (
      <div className="alert alert-error">
        <FiXCircle />
        <strong>Error:</strong> {error}
      </div>
    );
  }
  
  if (!deviceData || !cebData) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <span className="loading-text">Loading device data...</span>
      </div>
    );
  }

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

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch (error) {
      return timestamp; // Fallback to original if parsing fails
    }
  };

  const statsData = [
    {
      title: "Estimated Cost",
      value: `Rs. ${cost.toFixed(2)}`,
      unit: "monthly",
      icon: FiDollarSign,
      color: "success"
    },
    {
      title: "Live Power",
      value: livepower,
      unit: "kW",
      icon: FiZap,
      color: "primary"
    },
    {
      title: "Total Power",
      value: totalpower,
      unit: "kWh",
      icon: FiActivity,
      color: "info"
    },
    {
      title: "Device Status",
      value: deviceStatus ? "Active" : "Inactive",
      unit: deviceStatus ? "Online" : "Offline",
      icon: deviceStatus ? FiCheckCircle : FiXCircle,
      color: deviceStatus ? "success" : "danger"
    },
    {
      title: "Battery Level",
      value: battery,
      unit: "%",
      icon: FiBattery,
      color: "warning"
    },
    {
      title: "Last Updated",
      value: formatTimestamp(time),
      unit: "timestamp",
      icon: FiClock,
      color: "secondary"
    }
  ];

  const getColorClass = (color) => {
    const colors = {
      primary: 'var(--primary)',
      success: 'var(--success)',
      warning: 'var(--warning)',
      danger: 'var(--danger)',
      info: 'var(--info)',
      secondary: 'var(--secondary)'
    };
    return colors[color] || colors.primary;
  };

  return (
    <div>
      <div className="stats-grid">
        {statsData.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="stat-card">
              <div className="stat-header">
                <div className="stat-title">{stat.title}</div>
                <div className="stat-icon" style={{ color: getColorClass(stat.color) }}>
                  <IconComponent size={20} />
                </div>
              </div>
              <div className="stat-value" style={{ color: getColorClass(stat.color) }}>
                {stat.value}
              </div>
              <div className="stat-unit">{stat.unit}</div>
            </div>
          );
        })}
      </div>

      {/* Additional Measurements */}
      <div className="content-section">
        <h2 className="section-title">
          <FiActivity />
          Electrical Measurements
        </h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-title">Current</div>
              <div className="stat-icon" style={{ color: 'var(--info)' }}>
                <FiZap size={20} />
              </div>
            </div>
            <div className="stat-value" style={{ color: 'var(--info)' }}>
              {current}
            </div>
            <div className="stat-unit">Amperes</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-title">Voltage</div>
              <div className="stat-icon" style={{ color: 'var(--warning)' }}>
                <FiZap size={20} />
              </div>
            </div>
            <div className="stat-value" style={{ color: 'var(--warning)' }}>
              {voltage}
            </div>
            <div className="stat-unit">Volts</div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
      <div className="alert-modern alert-modern-danger">
        <FiXCircle />
        <strong>Error:</strong> {error}
      </div>
    );
  }
  
  if (!deviceData || !cebData) {
    return (
      <div className="text-center py-5">
        <div className="spinner-modern mx-auto mb-3"></div>
        <p className="text-muted">Loading device data...</p>
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
      value: time,
      unit: "timestamp",
      icon: FiClock,
      color: "secondary"
    }
  ];

  const getColorClass = (color) => {
    const colors = {
      primary: 'var(--primary-color)',
      success: 'var(--success-color)',
      warning: 'var(--warning-color)',
      danger: 'var(--danger-color)',
      info: 'var(--info-color)',
      secondary: 'var(--secondary-color)'
    };
    return colors[color] || colors.primary;
  };

  return (
    <div>
      <div className="grid-modern grid-modern-3">
        {statsData.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="stats-card">
              <div className="stats-card-header">
                <div className="stats-card-title">{stat.title}</div>
                <div className="stats-card-icon" style={{ background: `linear-gradient(135deg, ${getColorClass(stat.color)}, ${getColorClass(stat.color)}dd)` }}>
                  <IconComponent size={20} />
                </div>
              </div>
              <div className="stats-card-value" style={{ color: getColorClass(stat.color) }}>
                {stat.value}
              </div>
              <div className="stats-card-unit">{stat.unit}</div>
            </div>
          );
        })}
      </div>

      {/* Additional Measurements */}
      <div className="mt-5">
        <h4 className="mb-4 fw-semibold text-muted">
          <FiActivity className="me-2" />
          Electrical Measurements
        </h4>
        <div className="grid-modern grid-modern-2">
          <div className="stats-card">
            <div className="stats-card-header">
              <div className="stats-card-title">Current</div>
              <div className="stats-card-icon" style={{ background: 'linear-gradient(135deg, var(--info-color), var(--info-color)dd)' }}>
                <FiZap size={20} />
              </div>
            </div>
            <div className="stats-card-value" style={{ color: 'var(--info-color)' }}>
              {current}
            </div>
            <div className="stats-card-unit">Amperes</div>
          </div>
          
          <div className="stats-card">
            <div className="stats-card-header">
              <div className="stats-card-title">Voltage</div>
              <div className="stats-card-icon" style={{ background: 'linear-gradient(135deg, var(--warning-color), var(--warning-color)dd)' }}>
                <FiZap size={20} />
              </div>
            </div>
            <div className="stats-card-value" style={{ color: 'var(--warning-color)' }}>
              {voltage}
            </div>
            <div className="stats-card-unit">Volts</div>
          </div>
        </div>
      </div>
    </div>
  );
}

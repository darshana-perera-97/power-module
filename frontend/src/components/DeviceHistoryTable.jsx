import { useEffect, useState } from "react";
import { fetchDeviceHistory } from "../api";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { FiTrendingUp, FiBattery, FiZap, FiActivity, FiDollarSign, FiCheckCircle, FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function DeviceHistoryTable({ deviceId }) {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  // Reset to first page when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [history]);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <span className="loading-text">Loading historical data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <FiTrendingUp />
        <strong>Error:</strong> {error}
      </div>
    );
  }

  if (!history.length) {
    return (
      <div className="text-center">
        <div className="auth-icon" style={{ background: 'var(--gray-200)', color: 'var(--gray-500)' }}>
          <FiTrendingUp size={24} />
        </div>
        <h5 className="text-muted mb-2">No Historical Data</h5>
        <p className="text-muted">No historical data found for device {deviceId}</p>
      </div>
    );
  }

  // Pagination calculations
  const totalPages = Math.ceil(history.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = history.slice(startIndex, endIndex);

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
      color: "var(--success)",
      yDomain: [0, 1],
      yTicks: [0, 1],
      unit: "Online/Offline"
    },
    {
      title: "Battery Level",
      icon: FiBattery,
      dataKey: "battery",
      color: "var(--warning)",
      unit: "%"
    },
    {
      title: "Current",
      icon: FiZap,
      dataKey: "current",
      color: "var(--info)",
      unit: "A"
    },
    {
      title: "Live Power",
      icon: FiActivity,
      dataKey: "livepower",
      color: "var(--primary)",
      unit: "kW"
    },
    {
      title: "Total Power",
      icon: FiTrendingUp,
      dataKey: "totalpower",
      color: "var(--secondary)",
      unit: "kWh"
    },
    {
      title: "Cost",
      icon: FiDollarSign,
      dataKey: "cost",
      color: "var(--success)",
      unit: "Rs."
    }
  ];

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Reset to first page
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div>
      <div className="stats-grid">
        {chartConfigs.map((config, index) => {
          const IconComponent = config.icon;
          return (
            <div key={index} className="card">
              <div className="card-header">
                <div className="card-title">
                  <IconComponent size={20} style={{ color: config.color, marginRight: 'var(--space-3)' }} />
                  {config.title}
                </div>
              </div>
              <div className="card-body">
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
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>

      {/* Data Table */}
      <div className="content-section">
        <h2 className="section-title">
          <FiTrendingUp />
          Recent Data Points
        </h2>
        
        {/* Table Controls */}
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="d-flex align-items-center gap-4">
                <label className="form-label mb-0">
                  Show:
                  <select
                    className="form-input"
                    style={{ width: '80px', marginLeft: 'var(--space-2)' }}
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(e.target.value)}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  entries
                </label>
              </div>
              
              <div className="text-muted">
                Showing {startIndex + 1} to {Math.min(endIndex, history.length)} of {history.length} entries
              </div>
            </div>

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Battery</th>
                    <th>Current</th>
                    <th>Live Power</th>
                    <th>Total Power</th>
                    <th>Voltage</th>
                    <th>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((row, index) => (
                    <tr key={startIndex + index}>
                      <td>{row.time}</td>
                      <td>
                        <span className={`status-dot ${row.deviceStatus ? 'status-active' : ''}`}></span>
                        {row.deviceStatus ? 'Online' : 'Offline'}
                      </td>
                      <td>{row.battery}%</td>
                      <td>{row.current}A</td>
                      <td>{row.livepower}kW</td>
                      <td>{row.totalpower}kWh</td>
                      <td>{row.voltage}V</td>
                      <td>Rs. {row.calculatedCost?.toFixed(2) || '0.00'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-4">
                <div className="text-muted">
                  Page {currentPage} of {totalPages}
                </div>
                
                <div className="d-flex align-items-center gap-2">
                  <button
                    className="btn btn-secondary"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{ padding: 'var(--space-2) var(--space-3)' }}
                  >
                    <FiChevronLeft size={16} />
                    Previous
                  </button>
                  
                  <div className="d-flex gap-1">
                    {getPageNumbers().map((page, index) => (
                      <button
                        key={index}
                        className={`btn ${page === currentPage ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => typeof page === 'number' && handlePageChange(page)}
                        disabled={page === '...'}
                        style={{ 
                          padding: 'var(--space-2) var(--space-3)',
                          minWidth: '40px'
                        }}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    className="btn btn-secondary"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={{ padding: 'var(--space-2) var(--space-3)' }}
                  >
                    Next
                    <FiChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { FiTrendingUp, FiCalendar, FiZap, FiAlertCircle } from "react-icons/fi";

function DailyUsageViewer() {
    const [records, setRecords] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch("http://69.197.187.24:3020/api/daily-usage");
                if (!response.ok) throw new Error("Network response was not ok");
                const data = await response.json();
                setRecords(data);
                setError("");
            } catch (err) {
                setError("Failed to load daily usage data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-modern mx-auto mb-3"></div>
                <p className="text-muted">Loading daily usage data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert-modern alert-modern-danger">
                <FiAlertCircle />
                <strong>Error:</strong> {error}
            </div>
        );
    }

    if (!records.length) {
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
                <h5 className="text-muted mb-2">No Usage Data</h5>
                <p className="text-muted">No daily usage records available yet.</p>
            </div>
        );
    }

    const today = new Date().toISOString().slice(0, 10);
    const todayRecord = records.find(r => r.date === today);
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const yesterdayRecord = records.find(r => r.date === yesterday);

    // Calculate statistics
    const totalUsage = records.reduce((sum, record) => sum + record.totalUsage, 0);
    const averageUsage = totalUsage / records.length;
    const maxUsage = Math.max(...records.map(r => r.totalUsage));
    const minUsage = Math.min(...records.map(r => r.totalUsage));

    const statsData = [
        {
            title: "Today's Usage",
            value: todayRecord ? todayRecord.totalUsage.toLocaleString() : "0",
            unit: "kWh",
            icon: FiCalendar,
            color: "primary",
            subtitle: todayRecord ? "Current day consumption" : "No data for today"
        },
        {
            title: "Yesterday's Usage",
            value: yesterdayRecord ? yesterdayRecord.totalUsage.toLocaleString() : "0",
            unit: "kWh",
            icon: FiTrendingUp,
            color: "info",
            subtitle: yesterdayRecord ? "Previous day consumption" : "No data for yesterday"
        },
        {
            title: "Average Daily",
            value: averageUsage.toFixed(1),
            unit: "kWh",
            icon: FiZap,
            color: "success",
            subtitle: "Average consumption per day"
        },
        {
            title: "Peak Usage",
            value: maxUsage.toLocaleString(),
            unit: "kWh",
            icon: FiTrendingUp,
            color: "warning",
            subtitle: "Highest daily consumption"
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
            <div className="dashboard-header">
                <h2 className="dashboard-title">
                    <FiTrendingUp className="me-3" style={{ color: 'var(--primary-color)' }} />
                    Daily Usage Analytics
                </h2>
                <p className="dashboard-subtitle">
                    Monitor daily power consumption patterns and trends
                </p>
            </div>

            <div className="grid-modern grid-modern-4">
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
                            <div className="mt-2">
                                <small className="text-muted">{stat.subtitle}</small>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Recent Usage Table */}
            <div className="modern-card mt-5">
                <div className="modern-card-header">
                    <FiCalendar className="me-2" />
                    Recent Usage History
                </div>
                <div className="modern-card-body">
                    <div className="table-responsive">
                        <table className="table table-modern">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th className="text-center">Total Usage (kWh)</th>
                                    <th className="text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.slice(0, 10).map((record, index) => (
                                    <tr key={index}>
                                        <td className="fw-medium">
                                            {new Date(record.date).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td className="text-center fw-bold text-primary">
                                            {record.totalUsage.toLocaleString()}
                                        </td>
                                        <td className="text-center">
                                            <span className={`badge rounded-pill ${
                                                record.date === today ? 'bg-success' : 'bg-secondary'
                                            }`}>
                                                {record.date === today ? 'Today' : 'Historical'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Usage Insights */}
            <div className="modern-card mt-4">
                <div className="modern-card-header">
                    <FiTrendingUp className="me-2" />
                    Usage Insights
                </div>
                <div className="modern-card-body">
                    <div className="row">
                        <div className="col-md-6">
                            <h6 className="fw-semibold mb-3">Consumption Range</h6>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Minimum:</span>
                                <span className="fw-bold text-success">{minUsage.toFixed(1)} kWh</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Maximum:</span>
                                <span className="fw-bold text-warning">{maxUsage.toFixed(1)} kWh</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span className="text-muted">Average:</span>
                                <span className="fw-bold text-primary">{averageUsage.toFixed(1)} kWh</span>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <h6 className="fw-semibold mb-3">Data Summary</h6>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Total Records:</span>
                                <span className="fw-bold">{records.length}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Total Consumption:</span>
                                <span className="fw-bold text-primary">{totalUsage.toLocaleString()} kWh</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span className="text-muted">Period:</span>
                                <span className="fw-bold">
                                    {records.length > 0 ? `${records.length} day${records.length !== 1 ? 's' : ''}` : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DailyUsageViewer;

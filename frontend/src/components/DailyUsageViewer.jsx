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
            <div className="loading">
                <div className="spinner"></div>
                <span className="loading-text">Loading daily usage data...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-error">
                <FiAlertCircle />
                <strong>Error:</strong> {error}
            </div>
        );
    }

    if (!records.length) {
        return (
            <div className="text-center">
                <div className="auth-icon" style={{ background: 'var(--gray-200)', color: 'var(--gray-500)' }}>
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
                            <div className="mt-2">
                                <small className="text-muted">{stat.subtitle}</small>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Recent Usage Table */}
            <div className="content-section">
                <h2 className="section-title">
                    <FiCalendar />
                    Recent Usage History
                </h2>
                <div className="table-container">
                    <table className="table">
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
                                        <span className="badge" style={{ 
                                            background: record.date === today ? 'var(--success)' : 'var(--secondary)', 
                                            color: 'var(--white)', 
                                            padding: 'var(--space-1) var(--space-3)',
                                            borderRadius: 'var(--radius-lg)',
                                            fontSize: 'var(--font-size-sm)'
                                        }}>
                                            {record.date === today ? 'Today' : 'Historical'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Usage Summary */}
            <div className="content-section">
                <h2 className="section-title">
                    <FiTrendingUp />
                    Usage Summary
                </h2>
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-header">
                            <div className="stat-title">Total Records</div>
                            <div className="stat-icon" style={{ color: 'var(--info)' }}>
                                <FiCalendar size={20} />
                            </div>
                        </div>
                        <div className="stat-value" style={{ color: 'var(--info)' }}>
                            {records.length}
                        </div>
                        <div className="stat-unit">days</div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-header">
                            <div className="stat-title">Total Consumption</div>
                            <div className="stat-icon" style={{ color: 'var(--primary)' }}>
                                <FiZap size={20} />
                            </div>
                        </div>
                        <div className="stat-value" style={{ color: 'var(--primary)' }}>
                            {totalUsage.toLocaleString()}
                        </div>
                        <div className="stat-unit">kWh</div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-header">
                            <div className="stat-title">Min Usage</div>
                            <div className="stat-icon" style={{ color: 'var(--success)' }}>
                                <FiTrendingUp size={20} />
                            </div>
                        </div>
                        <div className="stat-value" style={{ color: 'var(--success)' }}>
                            {minUsage.toLocaleString()}
                        </div>
                        <div className="stat-unit">kWh</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DailyUsageViewer;

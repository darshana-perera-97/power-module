import React, { useEffect, useState } from "react";

function DailyUsageViewer() {
    const [records, setRecords] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch("http://69.197.187.24:3020/api/daily-usage")
            .then(res => {
                if (!res.ok) throw new Error("Network response was not ok");
                return res.json();
            })
            .then(setRecords)
            .catch(() => setError("Failed to load daily usage"));
    }, []);

    if (error) return <div className="alert alert-danger">{error}</div>;
    if (!records.length) return <div>No daily usage records yet.</div>;

    const today = new Date().toISOString().slice(0, 10);
    const todayRecord = records.find(r => r.date === today);

    return (
        <div className="card">
            <div className="card-header">Today's Total Power Usage</div>
            <div className="card-body">
                {todayRecord ? (
                    <h4>{todayRecord.totalUsage.toLocaleString()} kWh</h4>
                ) : (
                    <div>No data for today ({today}).</div>
                )}
            </div>
        </div>
    );
}

export default DailyUsageViewer;

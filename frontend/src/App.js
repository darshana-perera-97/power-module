import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import DeviceSelector from "./components/DeviceSelector";
import DeviceStateViewer from "./components/DeviceStateViewer";
import DeviceHistoryTable from "./components/DeviceHistoryTable";
import CebDataManager from "./components/CebDataManager";
import DailyUsageViewer from "./components/DailyUsageViewer";
import { FiZap, FiShield, FiLogOut, FiUser, FiLock } from "react-icons/fi";

function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    // Simulate API call delay
    setTimeout(() => {
      if (username === "admin" && password === "admin") {
        onLogin();
      } else {
        setError("Invalid credentials. Please try again.");
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, var(--primary-color), var(--primary-dark))' }}>
      <div className="form-modern" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center justify-content-center mb-3" style={{ 
            width: '60px', 
            height: '60px', 
            background: 'linear-gradient(135deg, var(--primary-color), var(--primary-dark))',
            borderRadius: 'var(--radius-lg)',
            color: 'var(--white)'
          }}>
            <FiShield size={24} />
          </div>
          <h2 className="dashboard-title mb-2">Admin Access</h2>
          <p className="dashboard-subtitle">Enter your credentials to continue</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label fw-semibold text-muted mb-2">
              <FiUser className="me-2" />
              Username
            </label>
            <input
              type="text"
              className="form-control-modern w-100"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="form-label fw-semibold text-muted mb-2">
              <FiLock className="me-2" />
              Password
            </label>
            <input
              type="password"
              className="form-control-modern w-100"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {error && (
            <div className="alert-modern alert-modern-danger mb-4">
              <FiShield />
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            className="btn-modern btn-modern-primary w-100"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="spinner-modern"></div>
                Signing In...
              </>
            ) : (
              <>
                <FiShield />
                Sign In
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function UserView() {
  const [selectedDevice, setSelectedDevice] = useState(
    localStorage.getItem("selectedDevice") || ""
  );

  const handleLogout = () => {
    localStorage.removeItem("selectedDevice");
    setSelectedDevice("");
  };

  return (
    <div className="min-vh-100" style={{ background: 'var(--gray-50)' }}>
      <Navbar selectedDevice={selectedDevice} onLogout={handleLogout} />
      <div className="dashboard-container">
        {!selectedDevice ? (
          <DeviceSelector onDeviceSelect={setSelectedDevice} />
        ) : (
          <>
            <div className="dashboard-header">
              <h1 className="dashboard-title">
                <FiZap className="me-3" style={{ color: 'var(--primary-color)' }} />
                Power Dashboard
              </h1>
              <p className="dashboard-subtitle">
                Real-time monitoring for device: <strong>{selectedDevice}</strong>
              </p>
            </div>
            
            <DeviceStateViewer deviceId={selectedDevice} />
            
            <div className="mt-5">
              <DeviceHistoryTable deviceId={selectedDevice} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function AdminView() {
  const [loggedIn, setLoggedIn] = useState(
    localStorage.getItem("adminLoggedIn") === "true"
  );
  const navigate = useNavigate();

  const handleLogin = () => {
    localStorage.setItem("adminLoggedIn", "true");
    setLoggedIn(true);
  };
  
  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    setLoggedIn(false);
    navigate("/");
  };

  if (!loggedIn) return <AdminLogin onLogin={handleLogin} />;

  return (
    <div className="min-vh-100" style={{ background: 'var(--gray-50)' }}>
      <nav className="navbar navbar-expand-lg nav-modern">
        <div className="container-fluid">
          <a href="#" className="nav-modern-brand">
            <FiZap />
            Smart Power Meter (Admin)
          </a>
          <button
            className="btn-modern btn-modern-secondary"
            onClick={handleLogout}
          >
            <FiLogOut />
            Logout
          </button>
        </div>
      </nav>
      
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">
            <FiShield className="me-3" style={{ color: 'var(--primary-color)' }} />
            Admin Dashboard
          </h1>
          <p className="dashboard-subtitle">
            Manage CEB data and monitor system usage
          </p>
        </div>
        
        <CebDataManager />
        
        <div className="mt-5">
          <DailyUsageViewer />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/power-module/admin" element={<AdminView />} />
      <Route path="/*" element={<UserView />} />
    </Routes>
  );
}

export default App;

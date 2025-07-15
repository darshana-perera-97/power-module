import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import DeviceSelector from "./components/DeviceSelector";
import DeviceStateViewer from "./components/DeviceStateViewer";
import DeviceHistoryTable from "./components/DeviceHistoryTable";
import CebDataManager from "./components/CebDataManager";
import DailyUsageViewer from "./components/DailyUsageViewer";
import { FiZap, FiShield, FiLogOut, FiUser, FiLock, FiMenu, FiX } from "react-icons/fi";

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
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">
            <FiShield size={24} />
          </div>
          <h2 className="auth-title">Admin Access</h2>
          <p className="auth-subtitle">Enter your credentials to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">
              <FiUser className="form-icon" />
              Username
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">
              <FiLock className="form-icon" />
              Password
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {error && (
            <div className="alert alert-error">
              <FiShield />
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            className="btn btn-primary btn-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="spinner"></div>
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("selectedDevice");
    setSelectedDevice("");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="dashboard">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <FiZap className="brand-icon" />
            <span className="brand-text">Power Meter</span>
          </div>
          <button className="sidebar-close" onClick={toggleSidebar}>
            <FiX size={20} />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-section">
            <h3 className="nav-title">Device</h3>
            {selectedDevice && (
              <div className="device-info">
                <div className="device-status">
                  <div className="status-dot status-active"></div>
                  <span className="device-name">{selectedDevice}</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="nav-section">
            <h3 className="nav-title">Actions</h3>
            <button 
              className="nav-item"
              onClick={handleLogout}
            >
              <FiLogOut />
              <span>Switch Device</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Navigation */}
        <header className="top-nav">
          <button className="menu-toggle" onClick={toggleSidebar}>
            <FiMenu size={20} />
          </button>
          
          <div className="nav-content">
            <h1 className="page-title">
              {selectedDevice ? 'Power Dashboard' : 'Welcome'}
            </h1>
            {selectedDevice && (
              <p className="page-subtitle">
                Monitoring device: <strong>{selectedDevice}</strong>
              </p>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="page-content">
          {!selectedDevice ? (
            <DeviceSelector onDeviceSelect={setSelectedDevice} />
          ) : (
            <>
              <DeviceStateViewer deviceId={selectedDevice} />
              
              <div className="content-section">
                <h2 className="section-title">Device History</h2>
                <DeviceHistoryTable deviceId={selectedDevice} />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function AdminView() {
  const [loggedIn, setLoggedIn] = useState(
    localStorage.getItem("adminLoggedIn") === "true"
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (!loggedIn) return <AdminLogin onLogin={handleLogin} />;

  return (
    <div className="dashboard">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <FiShield className="brand-icon" />
            <span className="brand-text">Admin Panel</span>
          </div>
          <button className="sidebar-close" onClick={toggleSidebar}>
            <FiX size={20} />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-section">
            <h3 className="nav-title">Administration</h3>
            <div className="nav-item active">
              <FiShield />
              <span>Dashboard</span>
            </div>
          </div>
          
          <div className="nav-section">
            <h3 className="nav-title">Actions</h3>
            <button 
              className="nav-item"
              onClick={handleLogout}
            >
              <FiLogOut />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Navigation */}
        <header className="top-nav">
          <button className="menu-toggle" onClick={toggleSidebar}>
            <FiMenu size={20} />
          </button>
          
          <div className="nav-content">
            <h1 className="page-title">Admin Dashboard</h1>
            <p className="page-subtitle">
              Manage CEB data and monitor system usage
            </p>
          </div>
        </header>

        {/* Page Content */}
        <div className="page-content">
          <div className="content-section">
            <h2 className="section-title">CEB Data Management</h2>
            <CebDataManager />
          </div>
          
          <div className="content-section">
            <h2 className="section-title">Daily Usage Analytics</h2>
            <DailyUsageViewer />
          </div>
        </div>
      </main>
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

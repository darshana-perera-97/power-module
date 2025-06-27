import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import DeviceSelector from "./components/DeviceSelector";
import DeviceStateViewer from "./components/DeviceStateViewer";
import DeviceHistoryTable from "./components/DeviceHistoryTable";
import CebDataManager from "./components/CebDataManager";
import DailyUsageViewer from "./components/DailyUsageViewer";

function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = e => {
    e.preventDefault();
    if (username === "admin" && password === "admin") {
      onLogin();
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "60vh" }}
    >
      <form
        onSubmit={handleSubmit}
        className="p-4 border rounded bg-white"
        style={{ minWidth: 300 }}
      >
        <h3 className="mb-3 text-center">Admin Login</h3>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoFocus
          />
        </div>
        <div className="mb-3">
          <input
            type="password"
            className="form-control"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        {error && <div className="alert alert-danger py-1">{error}</div>}
        <button type="submit" className="btn btn-primary w-100">
          Login
        </button>
      </form>
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
    <div>
      <Navbar selectedDevice={selectedDevice} onLogout={handleLogout} />
      <main className="container py-4">
        {!selectedDevice ? (
          <DeviceSelector onDeviceSelect={setSelectedDevice} />
        ) : (
          <>
            <DeviceStateViewer deviceId={selectedDevice} />
            <div className="mt-4">
              <DeviceHistoryTable deviceId={selectedDevice} />
            </div>
          </>
        )}
      </main>
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
    <div>
      <nav
        className="navbar navbar-expand-lg"
        style={{ background: "#0077b5" }}
      >
        <div className="container-fluid">
          <span className="navbar-brand text-white fw-bold">
            Smart Power Meter (Admin)
          </span>
          <button
            className="btn btn-outline-light ms-auto"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </nav>
      <main className="container py-4">
        <CebDataManager />
        <div className="mt-4">
          <DailyUsageViewer />
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminView />} />
      <Route path="/*" element={<UserView />} />
    </Routes>
  );
}

export default App;

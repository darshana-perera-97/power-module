import React from "react";
import { FiZap, FiLogOut, FiMonitor } from "react-icons/fi";

export default function Navbar({ selectedDevice, onLogout }) {
  return (
    <nav className="navbar navbar-expand-lg nav-modern">
      <div className="container-fluid">
        <a href="#" className="nav-modern-brand">
          <FiZap />
          Smart Power Meter
        </a>
        
        {selectedDevice && (
          <div className="d-flex align-items-center gap-4">
            <div className="d-flex align-items-center gap-2 text-white">
              <FiMonitor size={18} />
              <span className="fw-medium">Device:</span>
              <span className="fw-bold">{selectedDevice}</span>
            </div>
            
            <button
              onClick={onLogout}
              className="btn-modern btn-modern-secondary"
            >
              <FiLogOut />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

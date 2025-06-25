import React from "react";

export default function Navbar({ selectedDevice, onLogout }) {
  return (
    <nav className="navbar navbar-expand-lg" style={{ background: "#0077b5" }}>
      <div className="container-fluid">
        <span className="navbar-brand text-white fw-bold">Smart Power Meter</span>
        {selectedDevice && (
          <>
            <span className="text-white ms-3">
              📟 Selected Device: <strong>{selectedDevice}</strong>
            </span>
            <button
              onClick={onLogout}
              className="btn btn-outline-light ms-auto"
              style={{ marginLeft: "auto" }}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

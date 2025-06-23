export default function Navbar({ selectedDevice, onLogout }) {
  if (!selectedDevice) return null;

  return (
    <nav style={{ background: "#eee", padding: "10px" }}>
      <span>
        📟 Selected Device: <strong>{selectedDevice}</strong>
      </span>
      <button
        onClick={onLogout}
        style={{
          float: "right",
          background: "red",
          color: "white",
          border: "none",
          padding: "5px 10px",
        }}
      >
        Logout
      </button>
    </nav>
  );
}

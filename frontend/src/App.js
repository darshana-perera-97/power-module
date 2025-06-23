import React, { useState } from "react";
import Navbar from "./components/Navbar";
import DeviceSelector from "./components/DeviceSelector";
import DeviceStateViewer from "./components/DeviceStateViewer";
import DeviceHistoryTable from "./components/DeviceHistoryTable";

function App() {
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

      <main style={{ padding: "20px" }}>
        {!selectedDevice ? (
          <DeviceSelector onDeviceSelect={setSelectedDevice} />
        ) : (
          <>
            <DeviceStateViewer deviceId={selectedDevice} />
            <DeviceHistoryTable deviceId={selectedDevice} />
          </>
        )}
      </main>
    </div>
  );
}

export default App;

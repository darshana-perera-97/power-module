import express from "express";
import cors from "cors";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get } from "firebase/database";
import { getAuth, signInAnonymously } from "firebase/auth";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Setup directory context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "data.json");
const CEB_FILE = path.join(__dirname, "cebData.json");
const DAILY_FILE = path.join(__dirname, 'daily.json');


// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCTFNyeF82RAjPrn_EW--0psrsSTRk2xHg",
  authDomain: "test-project-e162c.firebaseapp.com",
  databaseURL: "https://test-project-e162c-default-rtdb.firebaseio.com",
  projectId: "test-project-e162c",
  storageBucket: "test-project-e162c.firebasestorage.app",
  messagingSenderId: "362777472424",
  appId: "1:362777472424:web:e278b46fba7920000d019d",
  measurementId: "G-0N0YKF1G6L",
};

initializeApp(firebaseConfig);
const auth = getAuth();
const db = getDatabase();
const dataRef = ref(db, "/");

let logArray = [];
let previousKeys = {}; // { "001": 50, "002": 70 }
let deviceActiveStatus = {}; // { "001": true, "002": false }

// Initialize data log file
async function initLogFile() {
  await fs.access(DATA_FILE).catch(() => fs.writeFile(DATA_FILE, "[]", "utf8"));
  const raw = await fs.readFile(DATA_FILE, "utf8");
  logArray = Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [];
}

// Get Colombo time
function getColomboTimeIso() {
  const now = new Date();
  const offset = 5.5 * 60;
  const localTs = new Date(now.getTime() + offset * 60 * 1000);
  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${localTs.getUTCFullYear()}-${pad(localTs.getUTCMonth() + 1)}-${pad(
      localTs.getUTCDate()
    )}` +
    `T${pad(localTs.getUTCHours())}:${pad(localTs.getUTCMinutes())}:${pad(
      localTs.getUTCSeconds()
    )}+05:30`
  );
}

// Refresh status of each device
async function refreshStatus() {
  const snap = await get(dataRef);
  const data = snap.val() || {};

  // Loop through each device (assuming devices have numeric keys)
  for (const key in data) {
    const value = data[key];
    if (
      typeof value === "object" &&
      value !== null &&
      value.device &&
      value.key !== undefined
    ) {
      const deviceId = value.device;
      const currentKey = value.key;
      const prevKey = previousKeys[deviceId];
      deviceActiveStatus[deviceId] =
        prevKey !== undefined && currentKey !== prevKey;
      previousKeys[deviceId] = currentKey;
    }
  }

  return data;
}

async function periodicLog() {
  try {
    const data = await refreshStatus();

    // Load CEB data
    const cebRaw = await fs.readFile(CEB_FILE, "utf8");
    const cebData = JSON.parse(cebRaw);

    // Clone data and add deviceStatus + calculatedCost
    const dataWithStatus = {};
    for (const key in data) {
      if (typeof data[key] === "object" && data[key] !== null) {
        const deviceObj = { ...data[key] };
        const deviceId = deviceObj.device;
        const power = Number(deviceObj.totalpower || 0);

        // Calculate cost
        let cost = 0;
        let found = false;
        for (let i = 0; i < cebData.ranges.length; i++) {
          const [min, max] = cebData.ranges[i].split("-").map(Number);
          if (power >= min && power <= max) {
            const fixed = cebData.monthlyCost[i];
            const unit = cebData.unitPrice[i];
            cost = fixed + unit * power;
            found = true;
            break;
          }
        }
        if (!found && cebData.ranges.length > 0) {
          const lastIndex = cebData.ranges.length - 1;
          const fixed = cebData.monthlyCost[lastIndex];
          const unit = cebData.unitPrice[lastIndex];
          cost = fixed + unit * power;
        }

        dataWithStatus[key] = {
          ...deviceObj,
          deviceStatus: deviceActiveStatus[deviceId] || false,
          calculatedCost: parseFloat(cost.toFixed(2)), // rounded to 2 decimal places
        };
      } else {
        dataWithStatus[key] = data[key];
      }
    }

    const record = {
      time: getColomboTimeIso(),
      data: dataWithStatus,
    };

    console.log(
      `[${new Date().toISOString()}] Device statuses:`,
      deviceActiveStatus
    );

    logArray.push(record);
    if (logArray.length > 100000) logArray = logArray.slice(-100000);
    await fs.writeFile(DATA_FILE, JSON.stringify(logArray, null, 2), "utf8");
  } catch (err) {
    console.error("❌ periodicLog error:", err);
  }
}


// Start the server and polling loop
async function start() {
  await initLogFile();
  await signInAnonymously(auth);
  console.log("✅ Signed in anonymously to RTDB");

  await periodicLog();
  setInterval(periodicLog, 2000); // every 2 seconds

  // Setup Express server
  const app = express();
  app.use(cors());
  const PORT = 3020;

  // ✅ GET /firebase → returns raw Firebase data
  app.get("/firebase", async (req, res) => {
    try {
      const snap = await get(dataRef);
      const data = snap.val();
      res.json(data);
    } catch (err) {
      res.status(500).json({
        error: "Failed to fetch data from Firebase",
        details: err.message,
      });
    }
  });

  // ✅ GET /currentState?device=001
  app.get("/currentState", async (req, res) => {
    try {
      const snap = await get(dataRef);
      const data = snap.val();
      const deviceId = req.query.device;

      if (deviceId) {
        const selected = Object.values(data).find(
          (item) => item.device === deviceId
        );

        if (!selected) {
          return res.status(404).json({ error: "Device not found" });
        }

        res.json({
          deviceStatus: deviceActiveStatus[deviceId] || false,
          lastUpdatedKey: previousKeys[deviceId] || null,
          time: getColomboTimeIso(),
          data: selected,
        });
      } else {
        res.json({
          deviceStatus: deviceActiveStatus,
          lastUpdatedKeys: previousKeys,
          time: getColomboTimeIso(),
          data,
        });
      }
    } catch (err) {
      res.status(500).json({
        error: "Failed to fetch Firebase data",
        details: err.message,
      });
    }
  });

  // ✅ GET /devices → returns only device IDs like ["001", "002"]
  app.get("/devices", async (req, res) => {
    try {
      const snap = await get(dataRef);
      const data = snap.val() || {};
      const deviceIds = Object.values(data)
        .filter((v) => typeof v === "object" && v !== null && v.device)
        .map((v) => v.device);
      res.json([...new Set(deviceIds)]); // remove duplicates
    } catch (err) {
      res.status(500).json({
        error: "Failed to fetch device IDs",
        details: err.message,
      });
    }
  });

  // ✅ GET /pastData?device=001
  app.get("/pastData", async (req, res) => {
    try {
      const { device } = req.query;
      if (!device) {
        return res.status(400).json({ error: "Missing device parameter" });
      }

      const raw = await fs.readFile(DATA_FILE, "utf8");
      const allLogs = JSON.parse(raw);

      // Filter logs where the device data exists
      const filtered = allLogs
        .filter((entry) => entry.data && entry.data[device])
        .map((entry) => {
          const deviceData = entry.data[device];
          const status = entry.deviceStatus
            ? entry.deviceStatus[device]
            : false;

          return {
            time: entry.time,
            status,
            ...deviceData,
          };
        });

      res.json(filtered);
    } catch (err) {
      res
        .status(500)
        .json({ error: "Failed to load device history", details: err.message });
    }
  });

  // GET /cebData → Returns full table
  app.get("/cebData", async (req, res) => {
    try {
      const raw = await fs.readFile(CEB_FILE, "utf8");
      const cebData = JSON.parse(raw);
      res.json(cebData);
    } catch (err) {
      res.status(500).json({
        error: "Failed to load CEB data",
        details: err.message,
      });
    }
  });

  // POST /cebData → Updates monthlyCost and unitPrice arrays
  app.post("/cebData", express.json(), async (req, res) => {
    try {
      const { monthlyCost, unitPrice } = req.body;
      if (
        !Array.isArray(monthlyCost) ||
        !Array.isArray(unitPrice) ||
        monthlyCost.length !== 6 ||
        unitPrice.length !== 6
      ) {
        return res.status(400).json({
          error: "monthlyCost and unitPrice must be arrays of 6 numbers",
        });
      }

      const raw = await fs.readFile(CEB_FILE, "utf8");
      const cebData = JSON.parse(raw);

      cebData.monthlyCost = monthlyCost;
      cebData.unitPrice = unitPrice;

      await fs.writeFile(CEB_FILE, JSON.stringify(cebData, null, 2), "utf8");

      res.json({ message: "CEB data updated successfully", cebData });
    } catch (err) {
      res.status(500).json({
        error: "Failed to update CEB data",
        details: err.message,
      });
    }
  });
  

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("💥 Fatal error:", err);
  process.exit(1);
});

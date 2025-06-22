import { initializeApp } from "firebase/app";
import { getDatabase, ref, get } from "firebase/database";
import { getAuth, signInAnonymously } from "firebase/auth";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "data.json");

let logArray = [];

async function initLogFile() {
  await fs.access(DATA_FILE).catch(() => fs.writeFile(DATA_FILE, "[]", "utf8"));
  const raw = await fs.readFile(DATA_FILE, "utf8");
  logArray = Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [];
}

const firebaseConfig = {
  apiKey: "AIzaSyDwILhkdXU4iqY3c6ju1QPsRctMGcn0sQs",
  authDomain: "power-module-trace-city.firebaseapp.com",
  databaseURL:
    "https://power-module-trace-city-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "power-module-trace-city",
  storageBucket: "power-module-trace-city.firebasestorage.app",
  messagingSenderId: "369893751494",
  appId: "1:369893751494:web:2adbfd98979833290c35c7",
  measurementId: "G-DGYXC5WB8H",
};

initializeApp(firebaseConfig);

const auth = getAuth();
const db = getDatabase();
const dataRef = ref(db, "/");

let previousKey = null;
let deviceActive = false;

async function refreshStatus() {
  const snap = await get(dataRef);
  const d = snap.val() || {};
  const k = d.key;
  deviceActive = previousKey !== null && k !== previousKey;
  previousKey = k;
  return d;
}

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

async function periodicLog() {
  try {
    const data = await refreshStatus();
    const record = {
      time: getColomboTimeIso(),
      data,
      deviceStatus: deviceActive,
    };
    console.log(
      `[${new Date().toISOString()}] Device is ${
        deviceActive ? "ACTIVE" : "INACTIVE"
      }`
    );
    logArray.push(record);
    if (logArray.length > 1000) logArray = logArray.slice(-1000);
    await fs.writeFile(DATA_FILE, JSON.stringify(logArray, null, 2), "utf8");
  } catch (err) {
    console.error("❌ periodicLog error:", err);
  }
}

async function start() {
  await initLogFile();
  await signInAnonymously(auth);
  console.log("✅ Signed in anonymously to RTDB");
  await periodicLog();
  setInterval(periodicLog, 2000);
}

start().catch((err) => {
  console.error("💥 Fatal error:", err);
  process.exit(1);
});

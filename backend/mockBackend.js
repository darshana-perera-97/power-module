import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";

// Firebase configuration
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Reference to the root or a specific path
const dataRef = ref(db, "/");

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomData() {
  return {
    battery: getRandomInt(0, 100), // e.g., percentage
    current: getRandomInt(0, 50), // e.g., in Amperes
    key: getRandomInt(0, 100), // assuming just a random value
    livepower: getRandomInt(0, 100), // live power draw
    totalpower: getRandomInt(0, 500), // total power used
    voltage: getRandomInt(200, 250), // voltage range
    device: "001", // voltage range
  };
}

async function updateData() {
  const newData = generateRandomData();
  try {
    await set(dataRef, newData);
    console.log(`[${new Date().toISOString()}] Updated with:`, newData);
  } catch (err) {
    console.error("Error updating data:", err);
  }
}

// Run immediately, then every second
updateData();
setInterval(updateData, 2000);

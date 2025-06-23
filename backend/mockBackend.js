import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";

// Firebase configuration
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Reference to the root or a specific path
const dataRef = ref(db, "/001");

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

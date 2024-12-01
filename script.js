// Firebase Initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  get,
  child,
  query,
  orderByChild,
  limitToFirst
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDibYIHaQLSjxqPhbtB-ghDizA5w3BuWUE",
  authDomain: "alein-clicker-game.firebaseapp.com",
  databaseURL: "https://alein-clicker-game-default-rtdb.firebaseio.com",
  projectId: "alein-clicker-game",
  storageBucket: "alein-clicker-game.firebasestorage.app",
  messagingSenderId: "796501018883",
  appId: "1:796501018883:web:c4555b143a38d984ec4136",
  measurementId: "G-QGWJ571PVS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Game variables
let score = 0;
let isGameActive = false;
let currentImage = 1;
const clickDelay = 750; // 3/4 second delay
let clickTimeout;

// Elements
const aleinImage = document.getElementById("aleinImage");
const startButton = document.getElementById("startButton");
const scoreDisplay = document.getElementById("score");
const leaderboardDiv = document.getElementById("leaderboard");

startButton.addEventListener("click", startGame);
aleinImage.addEventListener("click", handleClick);

// Start game
function startGame() {
  score = 0;
  isGameActive = true;
  currentImage = 1;
  aleinImage.src =
    "https://static.wixstatic.com/media/dae1d7_8eb573f205b04f4c9824986412fa186f~mv2.png"; // Reset to first image
  scoreDisplay.textContent = `Score: ${score}`;
  startButton.disabled = true;

  clearTimeout(clickTimeout); // Reset the timeout
  clickTimeout = setTimeout(endGame, 30000); // Game lasts for 30 seconds
}

// Handle click events
function handleClick() {
  if (!isGameActive) return;

  // Update score
  score++;
  scoreDisplay.textContent = `Score: ${score}`;

  // Alternate images
  currentImage = currentImage === 1 ? 2 : 1;
  aleinImage.src =
    currentImage === 1
      ? "https://static.wixstatic.com/media/dae1d7_8eb573f205b04f4c9824986412fa186f~mv2.png"
      : "https://static.wixstatic.com/media/dae1d7_127953395d4f45b7a7ea4a31782013fd~mv2.png";

  // Reset click timeout
  clearTimeout(clickTimeout);
  clickTimeout = setTimeout(() => {
    alert("You clicked too slowly! Game Over.");
    endGame();
  }, clickDelay);
}

// End game function
function endGame() {
  isGameActive = false;
  startButton.disabled = false;
  alert(`Game Over! Your final score is: ${score}`);
  recordScore(score);
}

// Record score function
function recordScore(finalScore) {
  const playerName = prompt("Enter your name for the leaderboard:");
  if (!playerName) return;

  // Store score in Firebase
  addNewScore(playerName, finalScore);
}

// Add score to Firebase
function addNewScore(name, score) {
  const newScoreRef = ref(db, "scores/" + Date.now()); // Use timestamp as unique key
  set(newScoreRef, {
    name: name,
    score: score
  })
    .then(() => {
      console.log("Score added to Firebase");
      fetchLeaderboard(); // Refresh leaderboard
    })
    .catch((error) => {
      console.error("Error adding score:", error);
    });
}

// Fetch leaderboard data from Firebase
function fetchLeaderboard() {
  const leaderboardRef = ref(db, "scores");

  get(leaderboardRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const leaderboardData = snapshot.val();
        console.log(leaderboardData); // Log to check if the data exists

        // Convert the data to an array and sort by score
        const leaderboardArray = Object.values(leaderboardData);
        leaderboardArray.sort((a, b) => b.score - a.score); // Sort by score (descending)

        displayLeaderboard(leaderboardArray);
      } else {
        console.log("No data available");
        leaderboardDiv.innerHTML = "<p>No scores yet.</p>";
      }
    })
    .catch((error) => {
      console.error("Error fetching leaderboard:", error);
      leaderboardDiv.innerHTML = "<p>Error fetching leaderboard data.</p>";
    });
}

// Display leaderboard on the page
function displayLeaderboard(data) {
  leaderboardDiv.innerHTML = "<h2>Leaderboard</h2>";

  // Check if data is available and valid
  if (data && data.length > 0) {
    // Sort leaderboard data by score (highest to lowest)
    data.sort((a, b) => b.score - a.score);

    // Display the top 10 leaderboard
    data.forEach((entry, index) => {
      leaderboardDiv.innerHTML += `<p>${index + 1}. ${entry.name} - ${
        entry.score
      }</p>`;
    });
  } else {
    leaderboardDiv.innerHTML += "<p>No scores yet.</p>";
  }
}

// Fetch leaderboard on page load
fetchLeaderboard();

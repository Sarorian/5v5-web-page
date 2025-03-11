import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import PlayersPage from "./pages/PlayersPage/PlayersPage";
import MatchDetails from "./pages/MatchDetails";
import PlayerProfile from "./pages//PlayersPage/PlayerProfile"; // Import Player Profile

function App() {
  return (
    <Router>
      <Navbar />
      <div>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/players" element={<PlayersPage />} />
          <Route path="/players/:id" element={<PlayerProfile />} />{" "}
          <Route path="/matches/:matchId" element={<MatchDetails />} />{" "}
          {/* Add this route */}
          {/* Uses Riot ID */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;

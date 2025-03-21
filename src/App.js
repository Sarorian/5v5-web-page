import React from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom"; // Use HashRouter instead of BrowserRouter
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import PlayersPage from "./pages/PlayersPage/PlayersPage";
import MatchDetails from "./pages/MatchDetails";
import PlayerProfile from "./pages/PlayersPage/PlayerProfile"; // Import Player Profile
import ChampionsPage from "./pages/ChampionsPage"; // Import Champions Page

function App() {
  return (
    <Router>
      <Navbar />
      <div>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/players" element={<PlayersPage />} />
          <Route path="/players/:id" element={<PlayerProfile />} />
          <Route path="/matches/:matchId" element={<MatchDetails />} />
          <Route path="/champions" element={<ChampionsPage />} />{" "}
          {/* Add the Champions page route */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;

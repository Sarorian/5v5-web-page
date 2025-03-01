import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import MatchHistory from "./pages/MatchHistory/MatchHistory"; // Import the new page

function App() {
  return (
    <Router>
      <Navbar />
      <div>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/match-history" element={<MatchHistory />} />{" "}
          {/* Add route for match history */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;

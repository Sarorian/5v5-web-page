import React, { useEffect, useState } from "react";
import axios from "axios"; // Make sure axios is imported
import common from "../helpers/common"; // Adjust the relative path
import { ToastContainer } from "react-toastify"; // Correct import

const HomePage = () => {
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [champions, setChampions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [playersRes, matchesRes, championsRes] = await Promise.all([
          axios.get(
            "https://lobsterapi-f663d2b5d447.herokuapp.com/api/players"
          ),
          axios.get(
            "https://lobsterapi-f663d2b5d447.herokuapp.com/api/matches"
          ),
          axios.get(
            "https://lobsterapi-f663d2b5d447.herokuapp.com/api/champions"
          ),
        ]);

        setPlayers(playersRes.data);
        setMatches(matchesRes.data);
        setChampions(championsRes.data);
      } catch (err) {
        common.displayMessage("error", "Error displaying data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Welcome</h1>

      {/* Toastify container to display notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
      />

      {loading ? <div className="dot-pulse"></div> : <></>}

      {/* You can render data from players, matches, champions here */}
    </div>
  );
};

export default HomePage;

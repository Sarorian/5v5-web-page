import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MatchCard from "../components/MatchCard"; // adjust path as needed

const HomePage = () => {
  const [matches, setMatches] = useState([]);
  const [playersLookup, setPlayersLookup] = useState({});
  const [loading, setLoading] = useState(true);
  const [patchVersion, setPatchVersion] = useState("15.7.1");
  const [championNames, setChampionNames] = useState({}); // To store champion names

  // Fetch the latest patch version
  useEffect(() => {
    const fetchPatchVersion = async () => {
      try {
        const response = await fetch(
          "https://ddragon.leagueoflegends.com/api/versions.json"
        );
        const data = await response.json();
        if (data && data.length > 0) {
          setPatchVersion(data[0]); // Set the latest patch version
        }
      } catch (err) {
        console.error("Failed to fetch patch version:", err);
      }
    };

    fetchPatchVersion();
  }, []);

  // Fetch matches and players, and set up player lookup
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [matchesRes, playersRes] = await Promise.all([
          fetch("https://lobsterapi-f663d2b5d447.herokuapp.com/api/matches"),
          fetch("https://lobsterapi-f663d2b5d447.herokuapp.com/api/players"),
        ]);
        const matchesData = await matchesRes.json();
        const playersData = await playersRes.json();

        // Create a players lookup object. Assuming player.gameName is unique.
        const lookup = {};
        playersData.forEach((player) => {
          lookup[player.gameName] = player;
        });
        setPlayersLookup(lookup);

        // Reverse match data to show latest at the top
        setMatches(matchesData.reverse());

        // Fetch and set champion names for the current patch
        fetchChampionNames();

        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, [patchVersion]);

  // Fetch champion names using the current patch version
  const fetchChampionNames = async () => {
    const url = `https://ddragon.leagueoflegends.com/cdn/${patchVersion}/data/en_US/champion.json`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      setChampionNames(data.data); // Set the champions data (ID -> Name)
    } catch (error) {
      console.error("Error fetching champion names:", error);
    }
  };

  // Helper function to get champion name by ID
  const idToName = (championId) => {
    const champion = championNames[championId];
    return champion ? champion.name : championId; // Return the name if found, else return ID
  };

  // Helper function to get champion icon URL
  const getChampionIcon = (champion) =>
    `https://ddragon.leagueoflegends.com/cdn/${patchVersion}/img/champion/${champion}.png`;

  if (loading) return <p style={styles.loading}>Loading match history...</p>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Recent Matches</h1>
      {matches.map((match) => (
        <MatchCard
          key={match._id}
          match={match}
          playersLookup={playersLookup}
          patchVersion={patchVersion}
          idToName={idToName}
          getChampionIcon={getChampionIcon}
        />
      ))}
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    maxWidth: "1000px",
    margin: "0 auto",
    color: "#fff",
    backgroundColor: "#121212",
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box",
  },
  title: {
    textAlign: "center",
    color: "#00bcd4",
    fontSize: "2.2rem",
    marginBottom: "30px",
  },
  loading: {
    textAlign: "center",
    color: "#ccc",
  },
  matchCard: {
    backgroundColor: "#1e1e1e",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "25px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
  },
  matchHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
    fontWeight: "bold",
    color: "#aaa",
    fontSize: "0.9rem",
    flexWrap: "wrap",
  },
  teams: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "20px",
  },
  team: {
    flex: "1 1 45%",
    minWidth: "280px",
  },
  winning: {
    color: "#4caf50",
    marginBottom: "10px",
    fontSize: "1.1rem",
  },
  losing: {
    color: "#f44336",
    marginBottom: "10px",
    fontSize: "1.1rem",
  },
  playerRow: {
    display: "flex",
    alignItems: "center",
    marginBottom: "6px",
    gap: "10px",
    fontSize: "0.95rem",
    flexWrap: "wrap",
  },
  icon: {
    width: "30px",
    height: "30px",
    borderRadius: "6px",
    flexShrink: 0,
  },
};

export default HomePage;

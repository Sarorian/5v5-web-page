// MatchDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";

const MatchDetails = () => {
  const { matchId } = useParams(); // Get matchId from URL
  const { search } = useLocation(); // Extract query parameters from URL
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract player from query params
  const riotID = new URLSearchParams(search).get("player"); // Get full riotID (e.g., Sarorian#NA1)
  const playerName = riotID ? riotID.split("#")[0] : null;

  useEffect(() => {
    const fetchMatchDetails = async () => {
      try {
        const response = await fetch(
          `https://lobsterapi-f663d2b5d447.herokuapp.com/api/matches/${matchId}`
        );
        if (!response.ok) throw new Error(`Error fetching match details`);
        const matchData = await response.json();

        setMatch(matchData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching match details:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchMatchDetails();
  }, [matchId]);

  if (loading)
    return (
      <div style={styles.container}>
        <h2>Loading...</h2>
      </div>
    );
  if (error)
    return (
      <div style={styles.container}>
        <h2>Error: {error}</h2>
      </div>
    );
  if (!match)
    return (
      <div style={styles.container}>
        <h2>Match not found.</h2>
      </div>
    );

  // Fetch the player object to get the riotID (assuming it's part of the match data)
  const player = [...match.winningTeam, ...match.losingTeam].find(
    (p) => p.playerName === playerName
  );

  if (!player) return <div>Player not found in this match</div>;

  return (
    <div style={styles.container}>
      <h1>Match Details</h1>
      <h3>
        Date: {match.date} | Time: {match.time}
      </h3>

      <h2>Winning Team</h2>
      <ul style={styles.list}>
        {match.winningTeam.map((player) => (
          <li key={player.playerName} style={styles.listItem}>
            {player.playerName} - {player.champion} ({player.role})
            <p>
              KDA: {player.kills} / {player.deaths} / {player.assists}
            </p>
          </li>
        ))}
      </ul>

      <h2>Losing Team</h2>
      <ul style={styles.list}>
        {match.losingTeam.map((player) => (
          <li key={player.playerName} style={styles.listItem}>
            {player.playerName} - {player.champion} ({player.role})
            <p>
              KDA: {player.kills} / {player.deaths} / {player.assists}
            </p>
          </li>
        ))}
      </ul>

      <h2>Bans</h2>
      <ul style={styles.list}>
        {match.bans.map((ban, index) => (
          <li key={index} style={styles.listItem}>
            {ban}
          </li>
        ))}
      </ul>

      {/* Dynamically generate the back link, URL encode the player riotID */}
      <Link
        to={`/players/${encodeURIComponent(riotID)}`} // Encode the full player riotID
        style={styles.link}
      >
        Back to Player Profile
      </Link>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    textAlign: "center",
    color: "#fff",
    backgroundColor: "#222",
    minHeight: "100vh",
  },
  list: { listStyleType: "none", padding: 0 },
  listItem: {
    backgroundColor: "#333",
    padding: "10px",
    borderRadius: "5px",
    marginBottom: "5px",
  },
  link: { color: "#1e90ff", textDecoration: "none", fontWeight: "bold" },
};

export default MatchDetails;

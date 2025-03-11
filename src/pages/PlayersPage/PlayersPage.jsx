import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const PlayersPage = () => {
  const [players, setPlayers] = useState([]);
  const [leader, setLeader] = useState(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch(
          "https://lobsterapi-f663d2b5d447.herokuapp.com/api/players"
        );
        const data = await response.json();

        // Calculate points for each player
        const playersWithPoints = data.map((player) => {
          const wins = player.gamesPlayed.wins;
          const gamesPlayed = wins + player.gamesPlayed.losses;
          const points = gamesPlayed > 0 ? (wins / gamesPlayed) * wins : 0;
          return { ...player, points };
        });

        // Sort players by points
        const sortedPlayers = playersWithPoints.sort(
          (a, b) => b.points - a.points
        );
        setPlayers(sortedPlayers);
        setLeader(sortedPlayers[0] || null);
      } catch (error) {
        console.error("Error fetching players:", error);
      }
    };

    fetchPlayers();
  }, []);

  const getChampionSplash = (championName) => {
    return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championName}_0.jpg`;
  };

  return (
    <div style={styles.container}>
      <h1>Players Leaderboard</h1>
      {leader && (
        <div
          style={{
            ...styles.leaderCard,
            backgroundImage: `url(${getChampionSplash(
              leader.favoriteChampion
            )})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <h2 style={styles.leaderText}>
            🏆 Leader: {leader.fullName} ({leader.riotID})
          </h2>
          <p style={styles.leaderText}>Points: {leader.points.toFixed(2)}</p>
          <p style={styles.leaderText}>
            Wins: {leader.gamesPlayed.wins}, Losses: {leader.gamesPlayed.losses}
          </p>
          <p style={styles.leaderText}>
            Favorite Champion: {leader.favoriteChampion}
          </p>
        </div>
      )}
      <h2>All Players</h2>
      <ul style={styles.list}>
        {players.map((player, index) => (
          <li key={player.riotID} style={styles.listItem}>
            <Link
              to={`/players/${encodeURIComponent(player.riotID)}`}
              style={styles.link}
            >
              {index + 1}. {player.fullName} ({player.riotID})
            </Link>
            - Points: {player.points.toFixed(2)} | Wins:{" "}
            {player.gamesPlayed.wins} | Losses: {player.gamesPlayed.losses}
          </li>
        ))}
      </ul>
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
  leaderCard: {
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Overlay to make text readable
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "20px",
    display: "inline-block",
    width: "100%",
    textAlign: "center",
  },
  leaderText: {
    color: "#fff",
    textShadow: "2px 2px 4px #000000", // Black text outline
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

export default PlayersPage;

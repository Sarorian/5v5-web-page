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

        const playersWithPointsAndKDA = data.map((player) => {
          const wins = player.gamesPlayed.wins;
          const gamesPlayed = wins + player.gamesPlayed.losses;
          const points = gamesPlayed > 0 ? (wins / gamesPlayed) * wins : 0;
          const deaths = player.deaths || 1;
          const kda = ((player.kills + player.assists) / deaths).toFixed(2);
          return { ...player, points, kda };
        });

        const sortedPlayers = playersWithPointsAndKDA.sort(
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
      <h1 style={styles.title}>🏆 Players Leaderboard</h1>
      {leader && (
        <div
          style={{
            ...styles.leaderCard,
            backgroundImage: `url(${getChampionSplash(
              leader.favoriteChampion
            )})`,
          }}
        >
          <div style={styles.overlay}>
            <h2>
              {leader.fullName} ({leader.riotID})
            </h2>
            <p>Points: {leader.points.toFixed(2)}</p>
            <p>
              KDA: {leader.kda} | Wins: {leader.gamesPlayed.wins}, Losses:{" "}
              {leader.gamesPlayed.losses}
            </p>
          </div>
        </div>
      )}
      <div style={styles.playersContainer}>
        {players.map((player, index) => (
          <div key={player.riotID} style={styles.playerCard}>
            <Link
              to={`/players/${encodeURIComponent(player.riotID)}`}
              style={styles.link}
            >
              <h3>
                #{index + 1} {player.fullName}
              </h3>
            </Link>
            <p>Points: {player.points.toFixed(2)}</p>
            <p>KDA: {player.kda}</p>
            <p>
              Wins: {player.gamesPlayed.wins} | Losses:{" "}
              {player.gamesPlayed.losses}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "40px 20px",
    textAlign: "center",
    background: "linear-gradient(to right, #141E30, #243B55)",
    minHeight: "100vh",
    color: "#fff",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    marginBottom: "20px",
  },
  leaderCard: {
    position: "relative",
    backgroundSize: "cover",
    backgroundPosition: "center",
    borderRadius: "15px",
    padding: "30px",
    textAlign: "center",
    boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.2)",
    marginBottom: "30px",
  },
  overlay: {
    background: "rgba(0, 0, 0, 0.7)",
    borderRadius: "15px",
    padding: "20px",
    color: "#fff",
  },
  playersContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    justifyContent: "center",
  },
  playerCard: {
    background: "rgba(255, 255, 255, 0.1)",
    padding: "15px",
    borderRadius: "10px",
    textAlign: "center",
    backdropFilter: "blur(5px)",
    transition: "0.3s",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
  },
  playerCardHover: {
    transform: "scale(1.05)",
  },
  link: {
    color: "#FFD700",
    textDecoration: "none",
    fontWeight: "bold",
    transition: "0.3s",
  },
};

export default PlayersPage;

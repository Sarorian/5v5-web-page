import React, { useEffect, useState } from "react";

const HomePage = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await fetch(
          "https://lobsterapi-f663d2b5d447.herokuapp.com/api/matches"
        );
        const data = await res.json();
        setMatches(data.reverse());
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch matches:", err);
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const getChampionIcon = (champion) =>
    `http://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/${champion}.png`;

  if (loading) return <p style={styles.loading}>Loading match history...</p>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Recent Matches</h1>
      {matches.map((match) => (
        <div key={match._id} style={styles.matchCard}>
          <div style={styles.matchHeader}>
            <span>{match.date}</span>
            <span>{match.time}</span>
          </div>
          <div style={styles.teams}>
            <div style={styles.team}>
              <h3 style={styles.winning}>Winning Team</h3>
              {match.winningTeam.map((player) => (
                <div key={player.playerName} style={styles.playerRow}>
                  <img
                    src={getChampionIcon(player.champion)}
                    alt={player.champion}
                    style={styles.icon}
                    onError={(e) => (e.target.style.display = "none")}
                  />
                  <span>
                    <strong>{player.playerName}</strong> - {player.champion} (
                    {player.kills}/{player.deaths}/{player.assists})
                  </span>
                </div>
              ))}
            </div>
            <div style={styles.team}>
              <h3 style={styles.losing}>Losing Team</h3>
              {match.losingTeam.map((player) => (
                <div key={player.playerName} style={styles.playerRow}>
                  <img
                    src={getChampionIcon(player.champion)}
                    alt={player.champion}
                    style={styles.icon}
                    onError={(e) => (e.target.style.display = "none")}
                  />
                  <span>
                    <strong>{player.playerName}</strong> - {player.champion} (
                    {player.kills}/{player.deaths}/{player.assists})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
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
  },
  title: {
    textAlign: "center",
    color: "#00bcd4",
    fontSize: "2rem",
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
  },
  teams: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
  },
  team: {
    width: "48%",
  },
  winning: {
    color: "#4caf50",
    marginBottom: "10px",
  },
  losing: {
    color: "#f44336",
    marginBottom: "10px",
  },
  playerRow: {
    display: "flex",
    alignItems: "center",
    marginBottom: "6px",
    gap: "10px",
  },
  icon: {
    width: "30px",
    height: "30px",
    borderRadius: "6px",
  },
};

export default HomePage;

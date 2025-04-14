// components/MatchCard.js
import React from "react";
import { Link } from "react-router-dom";

const MatchCard = ({
  match,
  playersLookup,
  patchVersion,
  idToName,
  getChampionIcon,
}) => {
  return (
    <div style={styles.matchCard}>
      <div style={styles.matchHeader}>
        <span>{match.date}</span>
        <span>{match.time}</span>
      </div>
      <div style={styles.teams}>
        {/* Winning Team */}
        <div style={styles.team}>
          <h3 style={styles.winning}>Winning Team</h3>
          {match.winningTeam.map((player) => {
            const playerInfo = playersLookup[player.playerName];
            return (
              <div key={player.playerName} style={styles.playerRow}>
                <img
                  src={getChampionIcon(player.champion)} // Keep it raw ID here
                  alt={idToName(player.champion)} // Use nice name here
                  title={idToName(player.champion)} // Tooltip = pretty name
                  style={styles.icon}
                  onError={(e) => (e.target.style.display = "none")}
                />

                <span>
                  {playerInfo ? (
                    <Link
                      to={`/players/${encodeURIComponent(playerInfo.riotID)}`}
                      style={{
                        color: "#00bcd4",
                        textDecoration: "none",
                        fontWeight: "bold",
                      }}
                    >
                      {player.playerName}
                    </Link>
                  ) : (
                    <strong>{player.playerName}</strong>
                  )}{" "}
                  – {idToName(player.champion)} ({player.kills}/{player.deaths}/
                  {player.assists})
                </span>
              </div>
            );
          })}
        </div>
        {/* Losing Team */}
        <div style={styles.team}>
          <h3 style={styles.losing}>Losing Team</h3>
          {match.losingTeam.map((player) => {
            const playerInfo = playersLookup[player.playerName];
            return (
              <div key={player.playerName} style={styles.playerRow}>
                <img
                  src={getChampionIcon(player.champion)} // Keep it raw ID here
                  alt={idToName(player.champion)} // Use nice name here
                  title={idToName(player.champion)} // Tooltip = pretty name
                  style={styles.icon}
                  onError={(e) => (e.target.style.display = "none")}
                />
                <span>
                  {playerInfo ? (
                    <Link
                      to={`/players/${encodeURIComponent(playerInfo.riotID)}`}
                      style={{
                        color: "#00bcd4",
                        textDecoration: "none",
                        fontWeight: "bold",
                      }}
                    >
                      {player.playerName}
                    </Link>
                  ) : (
                    <strong>{player.playerName}</strong>
                  )}{" "}
                  – {idToName(player.champion)} ({player.kills}/{player.deaths}/
                  {player.assists})
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const styles = {
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

export default MatchCard;

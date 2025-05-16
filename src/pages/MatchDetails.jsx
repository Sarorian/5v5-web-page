import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";

const MatchDetails = () => {
  const { matchId } = useParams();
  const { search } = useLocation();

  const riotID = new URLSearchParams(search).get("player");
  const tagLine = riotID ? riotID.split("#")[1] : null;
  const [patchVersion, setPatchVersion] = useState("15.7.1");
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [championNames, setChampionNames] = useState({});

  useEffect(() => {
    const fetchMatchDetails = async () => {
      try {
        const response = await fetch(
          `https://lobsterapi-f663d2b5d447.herokuapp.com/api/matches/${matchId}`
        );
        if (!response.ok) throw new Error("Error fetching match details");
        const matchData = await response.json();
        setMatch(matchData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatchDetails();
  }, [matchId]);

  useEffect(() => {
    const fetchPatchVersion = async () => {
      try {
        const response = await fetch(
          "https://ddragon.leagueoflegends.com/api/versions.json"
        );
        const data = await response.json();
        if (data.length > 0) {
          setPatchVersion(data[0]);
        }
      } catch (err) {
        console.error("Failed to fetch patch version:", err);
      }
    };

    fetchPatchVersion();
  }, []);

  useEffect(() => {
    const fetchChampionNames = async () => {
      const url = `https://ddragon.leagueoflegends.com/cdn/${patchVersion}/data/en_US/champion.json`;
      try {
        const response = await fetch(url);
        const data = await response.json();
        setChampionNames(data.data);
      } catch (error) {
        console.error("Error fetching champion names:", error);
      }
    };

    fetchChampionNames();
  }, [patchVersion]);

  const idToName = (championId) => {
    const champion = championNames[championId];
    return champion ? champion.name : championId;
  };

  const getChampionIcon = (champion) =>
    `https://ddragon.leagueoflegends.com/cdn/${patchVersion}/img/champion/${champion}.png`;

  if (loading) return <p style={styles.loading}>Loading match history...</p>;

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
          {match.winningTeam.map((player) => (
            <div key={player.playerName} style={styles.playerRow}>
              <img
                src={getChampionIcon(player.champion)}
                alt={player.champion}
                style={styles.icon}
                onError={(e) => (e.target.style.display = "none")}
              />
              <span>
                <Link
                  to={`/players/${encodeURIComponent(
                    `${player.playerName}#${tagLine}`
                  )}`}
                  style={styles.playerLink}
                >
                  {player.playerName}
                </Link>{" "}
                –{" "}
                <span style={styles.championName}>
                  {idToName(player.champion)}
                </span>
                (
                <span style={styles.kda}>
                  {player.kills}/{player.deaths}/{player.assists}
                </span>
                )
              </span>
            </div>
          ))}
        </div>
        {/* Losing Team */}
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
                <Link
                  to={`/players/${encodeURIComponent(
                    `${player.playerName}#${tagLine}`
                  )}`}
                  style={styles.playerLink}
                >
                  {player.playerName}
                </Link>{" "}
                –{" "}
                <span style={styles.championName}>
                  {idToName(player.champion)}
                </span>
                (
                <span style={styles.kda}>
                  {player.kills}/{player.deaths}/{player.assists}
                </span>
                )
              </span>
            </div>
          ))}
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
    marginLeft: "1rem", // Add left margin
    marginRight: "1rem", // Add right margin
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
  playerLink: {
    color: "#00bcd4",
    textDecoration: "none",
    fontWeight: "bold",
  },
  championName: {
    color: "#fff", // Champion name text set to white
  },
  kda: {
    color: "#fff", // KDA text set to white
  },
  loading: {
    textAlign: "center",
    color: "#ccc",
  },
};

export default MatchDetails;

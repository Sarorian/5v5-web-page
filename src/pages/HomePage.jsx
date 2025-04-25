import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MatchCard from "../components/MatchCard"; // adjust path as needed

const HomePage = () => {
  const [matches, setMatches] = useState([]);
  const [playersLookup, setPlayersLookup] = useState({});
  const [loading, setLoading] = useState(true);
  const [patchVersion, setPatchVersion] = useState("15.7.1");
  const [championNames, setChampionNames] = useState({});
  const [funStats, setFunStats] = useState({});

  useEffect(() => {
    const fetchPatchVersion = async () => {
      try {
        const response = await fetch(
          "https://ddragon.leagueoflegends.com/api/versions.json"
        );
        const data = await response.json();
        if (data && data.length > 0) {
          setPatchVersion(data[0]);
        }
      } catch (err) {
        console.error("Failed to fetch patch version:", err);
      }
    };

    fetchPatchVersion();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [matchesRes, playersRes] = await Promise.all([
          fetch("https://lobsterapi-f663d2b5d447.herokuapp.com/api/matches"),
          fetch("https://lobsterapi-f663d2b5d447.herokuapp.com/api/players"),
        ]);
        const matchesData = await matchesRes.json();
        const playersData = await playersRes.json();

        const lookup = {};
        playersData.forEach((player) => {
          lookup[player.gameName] = player;
        });
        setPlayersLookup(lookup);
        setMatches(
          matchesData.sort((a, b) => {
            if (a.season !== b.season) {
              return b.season - a.season; // Higher season number comes first
            }
            return b.game - a.game; // Within same season, higher game number comes first
          })
        );

        fetchChampionNames();

        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, [patchVersion]);

  useEffect(() => {
    if (!matches.length) return;

    const uniqueChamps = {};
    const playerGames = {};
    const champUsage = {};
    const kdaStats = {};
    const winStreaks = {};
    const loseStreaks = {};

    let currentStreaks = {};

    matches.forEach((match) => {
      const allPlayers = [...match.winningTeam, ...match.losingTeam];

      allPlayers.forEach((p) => {
        if (!uniqueChamps[p.playerName]) uniqueChamps[p.playerName] = new Set();
        uniqueChamps[p.playerName].add(p.champion);

        playerGames[p.playerName] = (playerGames[p.playerName] || 0) + 1;

        champUsage[p.champion] = (champUsage[p.champion] || 0) + 1;

        if (!kdaStats[p.playerName]) {
          kdaStats[p.playerName] = { kills: 0, assists: 0, deaths: 0 };
        }
        kdaStats[p.playerName].kills += p.kills;
        kdaStats[p.playerName].assists += p.assists;
        kdaStats[p.playerName].deaths += p.deaths;
      });

      const updateStreaks = (team, isWin) => {
        team.forEach((p) => {
          const name = p.playerName;
          const prev = currentStreaks[name] || { type: null, count: 0 };

          if (isWin) {
            if (prev.type === "win") {
              prev.count += 1;
            } else {
              if (prev.type === "lose") {
                loseStreaks[name] = Math.max(
                  loseStreaks[name] || 0,
                  prev.count
                );
              }
              prev.count = 1;
              prev.type = "win";
            }
            winStreaks[name] = Math.max(winStreaks[name] || 0, prev.count);
          } else {
            if (prev.type === "lose") {
              prev.count += 1;
            } else {
              if (prev.type === "win") {
                winStreaks[name] = Math.max(winStreaks[name] || 0, prev.count);
              }
              prev.count = 1;
              prev.type = "lose";
            }
            loseStreaks[name] = Math.max(loseStreaks[name] || 0, prev.count);
          }
          currentStreaks[name] = prev;
        });
      };

      updateStreaks(match.winningTeam, true);
      updateStreaks(match.losingTeam, false);
    });

    const bestKDA = Object.entries(kdaStats)
      .filter(([name]) => playerGames[name] >= 50) // Only players with 50+ games
      .map(([name, { kills, assists, deaths }]) => {
        const kda = deaths === 0 ? kills + assists : (kills + assists) / deaths;
        return { name, avgKDA: kda.toFixed(2) };
      })
      .sort((a, b) => b.avgKDA - a.avgKDA)[0];

    const mostUnique = Object.entries(uniqueChamps)
      .map(([name, champs]) => ({ name, count: champs.size }))
      .sort((a, b) => b.count - a.count)[0];

    const mostPlayed = Object.entries(playerGames).sort(
      (a, b) => b[1] - a[1]
    )[0];

    const mostUsedChamp = Object.entries(champUsage).sort(
      (a, b) => b[1] - a[1]
    )[0];

    const longestWinStreak = Object.entries(winStreaks).sort(
      (a, b) => b[1] - a[1]
    )[0];

    const longestLoseStreak = Object.entries(loseStreaks).sort(
      (a, b) => b[1] - a[1]
    )[0];

    setFunStats({
      bestKDA,
      mostUnique,
      mostPlayed,
      mostUsedChamp,
      longestWinStreak,
      longestLoseStreak,
    });
  }, [matches]);

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

  const idToName = (championId) => {
    const champion = championNames[championId];
    return champion ? champion.name : championId;
  };

  const getChampionIcon = (champion) =>
    `https://ddragon.leagueoflegends.com/cdn/${patchVersion}/img/champion/${champion}.png`;

  if (loading) return <p style={styles.loading}>Loading match history...</p>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Recent Matches</h1>
      <div style={styles.statsCard}>
        <h2 style={{ color: "#ffca28", marginBottom: "10px" }}>Fun Stats</h2>
        <ul>
          <li>
            🎯 Best KDA: {funStats.bestKDA?.name} ({funStats.bestKDA?.avgKDA})
          </li>
          <li>
            🧠 Most Unique Champions: {funStats.mostUnique?.name} (
            {funStats.mostUnique?.count})
          </li>
          <li>
            🏆 Most Games Played: {funStats.mostPlayed?.[0]} (
            {funStats.mostPlayed?.[1]})
          </li>
          <li>
            🔥 Longest Win Streak: {funStats.longestWinStreak?.[0]} (
            {funStats.longestWinStreak?.[1]})
          </li>
          <li>
            💀 Longest Lose Streak: {funStats.longestLoseStreak?.[0]} (
            {funStats.longestLoseStreak?.[1]})
          </li>
          <li>
            👑 Most Played Champion: {funStats.mostUsedChamp?.[0]} (
            {funStats.mostUsedChamp?.[1]} times)
          </li>
        </ul>
      </div>

      {matches.map((match) => (
        <div key={match._id} style={styles.matchCard}>
          <div style={styles.matchHeader}>
            <span>{match.date}</span>
            <span>{match.time}</span>
          </div>
          <div style={styles.teams}>
            {/* Winning Team */}
            <div style={styles.team}>
              <h3 style={styles.winning}>Winning Team</h3>
              {match.winningTeam.map((player) => {
                // Get player info from lookup using playerName
                const playerInfo = playersLookup[player.playerName];
                return (
                  <div key={player.playerName} style={styles.playerRow}>
                    <img
                      src={getChampionIcon(player.champion)}
                      alt={player.champion}
                      style={styles.icon}
                      onError={(e) => (e.target.style.display = "none")}
                    />
                    <span>
                      {playerInfo ? (
                        <Link
                          to={`/players/${encodeURIComponent(
                            playerInfo.riotID
                          )}`}
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
                      – {idToName(player.champion)} ({player.kills}/
                      {player.deaths}/{player.assists})
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
                      src={getChampionIcon(player.champion)}
                      alt={player.champion}
                      style={styles.icon}
                      onError={(e) => (e.target.style.display = "none")}
                    />
                    <span>
                      {playerInfo ? (
                        <Link
                          to={`/players/${encodeURIComponent(
                            playerInfo.riotID
                          )}`}
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
                      – {idToName(player.champion)} ({player.kills}/
                      {player.deaths}/{player.assists})
                    </span>
                  </div>
                );
              })}
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
  statsCard: {
    backgroundColor: "#2a2a2a",
    padding: "15px 20px",
    borderRadius: "10px",
    marginBottom: "30px",
    color: "#eee",
    fontSize: "1rem",
    lineHeight: "1.6",
    boxShadow: "0 3px 8px rgba(0,0,0,0.3)",
  },
};

export default HomePage;

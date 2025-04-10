import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const PlayerProfile = () => {
  const { id } = useParams(); // Get Riot ID from URL
  const [player, setPlayer] = useState(null);
  const [matches, setMatches] = useState([]); // Store match history
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [championNames, setChampionNames] = useState({}); // Store champion names
  const [patchVersion, setPatchVersion] = useState("1.15.7");

  useEffect(() => {
    const fetchPatchVersion = async () => {
      try {
        const response = await fetch(
          "https://ddragon.leagueoflegends.com/api/versions.json"
        );
        const data = await response.json();
        if (data && data.length > 0) {
          setPatchVersion(data[0]); // Latest patch
        }
      } catch (error) {
        console.error("Error fetching patch version:", error);
      }
    };

    fetchPatchVersion();
    const fetchPlayerData = async () => {
      try {
        const encodedID = encodeURIComponent(id);

        // Fetch player info
        const playerResponse = await fetch(
          `https://lobsterapi-f663d2b5d447.herokuapp.com/api/players/${encodedID}`
        );
        if (!playerResponse.ok)
          throw new Error(`API error: ${playerResponse.status}`);
        const playerData = await playerResponse.json();

        // Fetch match history for this player
        const matchesResponse = await fetch(
          `https://lobsterapi-f663d2b5d447.herokuapp.com/api/matches?player=${playerData.gameName}`
        );
        if (!matchesResponse.ok)
          throw new Error(`API error: ${matchesResponse.status}`);
        const matchesData = await matchesResponse.json();

        const fetchPatch = async () => {
          const url = "https://ddragon.leagueoflegends.com/api/versions.json";
          try {
            const response = await fetch(url);
            const data = await response.json();
            return data[0]; // Return the latest patch version
          } catch (error) {
            console.error("Error fetching patches:", error);
          }
        };

        const idToName = async (championId, patch) => {
          const url = `https://ddragon.leagueoflegends.com/cdn/${patch}/data/en_US/champion.json`;
          try {
            const response = await fetch(url);
            const data = await response.json();
            const champions = data.data; // Get the champions data

            if (champions[championId]) {
              return champions[championId].name;
            } else {
              console.error("Champion ID not found");
              return null;
            }
          } catch (error) {
            console.error("Error fetching champion data:", error);
            return null;
          }
        };

        const patch = await fetchPatch();

        // Fetch all champions' names and store them
        const allChampionNames = {};
        const championIds = [
          ...Object.keys(playerData.championsPlayed || {}),
          ...Object.keys(playerData.rolesPlayed || {}),
        ];

        for (let championId of championIds) {
          const name = await idToName(championId, patch);
          if (name) {
            allChampionNames[championId] = name;
          }
        }

        console.log("Fetched player:", playerData);
        console.log("Fetched matches:", matchesData);

        setPlayer(playerData);
        setMatches(matchesData);
        setChampionNames(allChampionNames);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [id]);

  const getChampionSplash = (championName) => {
    return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championName}_0.jpg`;
  };

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
  if (!player)
    return (
      <div style={styles.container}>
        <h2>Player not found.</h2>
      </div>
    );

  // Safe defaults
  const wins = player.gamesPlayed?.wins || 0;
  const losses = player.gamesPlayed?.losses || 0;
  const totalGames = wins + losses;
  const winrate = ((wins / totalGames) * 100).toFixed(2);

  // Find most common role
  // Find most common role
  const mostCommonRole = Object.entries(player.rolesPlayed || [])
    .sort((a, b) => b[1].wins + b[1].losses - (a[1].wins + a[1].losses))
    .shift();
  const mostCommonRoleName = mostCommonRole
    ? mostCommonRole[0].toUpperCase()
    : "N/A"; // Capitalizing the role name

  // Find most common champion
  const mostCommonChampion = Object.entries(player.championsPlayed || [])
    .sort((a, b) => b[1].wins + b[1].losses - (a[1].wins + a[1].losses))
    .shift();
  const mostCommonChampionName = mostCommonChampion
    ? championNames[mostCommonChampion[0]] || mostCommonChampion[0]
    : "N/A";

  // Find winrate as captain
  const captainGames = player.gamesAsCaptain
    ? player.gamesAsCaptain.wins + player.gamesAsCaptain.losses
    : 0;
  const captainWins = player.gamesAsCaptain ? player.gamesAsCaptain.wins : 0;
  const captainWinrate = captainGames
    ? ((captainWins / captainGames) * 100).toFixed(2)
    : "0";

  // Calculate KDA (Kills + Assists / Deaths)
  const kda = ((player.kills + player.assists) / player.deaths).toFixed(2);

  return (
    <div style={styles.container}>
      <div
        style={{
          ...styles.header,
          backgroundImage: `url(${getChampionSplash(player.favoriteChampion)})`,
        }}
      >
        <div style={styles.statsOverlay}>
          <h1 style={styles.profileHeader}>
            {player.fullName} ({player.riotID})
          </h1>
          <div style={styles.stats}>
            <p>
              <strong>Total Games:</strong> {totalGames}
            </p>
            <p>
              <strong>Most Common Role:</strong> {mostCommonRoleName}
            </p>
            <p>
              <strong>Most Common Champion:</strong> {mostCommonChampionName}
            </p>
            <p>
              <strong>Winrate:</strong> {winrate}%
            </p>
            <p>
              <strong>Winrate as Captain:</strong> {captainWinrate}%
            </p>
            <p>
              <strong>KDA:</strong> {kda}
            </p>
          </div>
        </div>
      </div>
      <div style={styles.flexContainer}>
        <div style={styles.sideColumn}>
          <h2 style={styles.profileText}>Champion Stats</h2>
          <ul style={styles.championStatsList}>
            {Object.entries(player.championsPlayed || {})
              .sort(
                (a, b) => b[1].wins + b[1].losses - (a[1].wins + a[1].losses)
              )
              .map(([championId, stats]) => {
                const totalGames = stats.wins + stats.losses;
                const winRate = totalGames
                  ? ((stats.wins / totalGames) * 100).toFixed(0)
                  : 0;
                const kda = (
                  (stats.kills + stats.assists) /
                  Math.max(stats.deaths, 1)
                ).toFixed(2);
                const avgCS = stats.cs ? (stats.cs / totalGames).toFixed(1) : 0;
                const championName = championNames[championId] || championId;
                const kdaColor =
                  kda >= 5
                    ? "#E17E00"
                    : kda >= 3
                    ? "#00AEEF"
                    : kda >= 2
                    ? "#00C851"
                    : "#D9534F";

                return (
                  <li key={championId} style={styles.championRow}>
                    <div style={styles.championLeft}>
                      <img
                        src={`https://ddragon.leagueoflegends.com/cdn/${patchVersion}/img/champion/${championId}.png`}
                        alt={championName}
                        style={styles.championIcon}
                      />
                      <div>
                        <div style={styles.championName}>{championName}</div>
                      </div>
                    </div>

                    <div style={styles.kdaSection}>
                      <div style={{ ...styles.kdaText, color: kdaColor }}>
                        {kda}:1 KDA
                      </div>
                      <div style={styles.kdaDetails}>
                        {stats.kills} / {stats.deaths} / {stats.assists}
                      </div>
                    </div>

                    <div style={styles.winrateSection}>
                      <div>{winRate}%</div>
                      <div style={styles.gamesText}>{totalGames} Games</div>
                    </div>
                  </li>
                );
              })}
          </ul>
        </div>

        <div style={styles.centerColumn}>
          <h2 style={styles.profileText}>Match History</h2>
          <ul style={styles.list}>
            {matches.length > 0 ? (
              matches.map((match) => {
                const playerData = [
                  ...match.winningTeam,
                  ...match.losingTeam,
                ].find((p) => p.playerName === player.gameName);
                if (!playerData) return null;

                const isWin = match.winningTeam.some(
                  (p) => p.playerName === player.gameName
                );
                const championName =
                  championNames[playerData.champion] || playerData.champion;
                return (
                  <li
                    key={match._id}
                    style={{
                      ...styles.listItem,
                      backgroundColor: isWin ? "#228B22" : "#8B0000",
                    }}
                  >
                    <strong>{isWin ? "Victory 🏆" : "Defeat ❌"}</strong> -{" "}
                    {championName}
                    <p>
                      KDA: {playerData.kills} / {playerData.deaths} /{" "}
                      {playerData.assists}
                    </p>
                    <Link
                      to={`/matches/${match._id}?player=${encodeURIComponent(
                        player.riotID
                      )}`}
                      style={styles.link}
                    >
                      View Match Details
                    </Link>
                  </li>
                );
              })
            ) : (
              <p>No matches found for {player.fullName}.</p>
            )}
          </ul>
        </div>

        <div style={styles.sideColumn}>
          <h2 style={styles.profileText}>Role Stats</h2>
          <ul style={styles.list}>
            {Object.entries(player.rolesPlayed || {})
              .sort(
                (a, b) => b[1].wins + b[1].losses - (a[1].wins + a[1].losses)
              )
              .map(([role, stats]) => {
                const roleGamesPlayed = stats.wins + stats.losses;
                const roleWinrate = roleGamesPlayed
                  ? ((stats.wins / roleGamesPlayed) * 100).toFixed(2)
                  : 0;
                return (
                  <li key={role} style={styles.listItem}>
                    <strong>{role.toUpperCase()}</strong>
                    <p>
                      Games Played: {roleGamesPlayed}, Winrate: {roleWinrate}%
                    </p>
                  </li>
                );
              })}
          </ul>
        </div>
      </div>

      <Link to="/players" style={styles.link}>
        Back to Leaderboard
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
  header: {
    width: "100%",
    height: "445px", // Fixed height for the header to constrain vertical size
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Dark overlay for text readability
    backgroundSize: "cover", // Ensures the image covers the entire width
    backgroundPosition: "center", // Keeps the image centered horizontally
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    textAlign: "center",
    marginBottom: "20px",
  },
  statsOverlay: {
    position: "absolute",
    bottom: "10px",
    left: "50%",
    transform: "translateX(-50%)",
    color: "#fff",
    textShadow: "2px 2px 4px #000000", // Black text outline
    fontSize: "1rem",
    padding: "10px",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Make the stats stand out against the background
    borderRadius: "10px",
  },
  stats: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  profileHeader: {
    color: "#fff",
    textShadow: "2px 2px 4px #000000", // Black text outline
    fontSize: "2rem",
  },
  profileText: {
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
  flexContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginTop: "30px",
    flexWrap: "wrap", // optional for responsiveness
  },

  centerColumn: {
    flex: 2,
    minWidth: "300px",
  },

  sideColumn: {
    flex: 1,
    minWidth: "250px",
  },
  championStatsList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },

  championRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    backgroundColor: "#2e2e3a",
    marginBottom: "8px",
    borderRadius: "8px",
    color: "#fff",
  },

  championLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  championIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    objectFit: "cover",
  },

  championName: {
    fontWeight: "bold",
    fontSize: "16px",
  },

  csText: {
    fontSize: "13px",
    color: "#ccc",
  },

  kdaSection: {
    textAlign: "center",
  },

  kdaText: {
    fontWeight: "bold",
    fontSize: "15px",
  },

  kdaDetails: {
    fontSize: "13px",
    color: "#bbb",
  },

  winrateSection: {
    textAlign: "right",
    fontSize: "13px",
    color: "#bbb",
  },

  gamesText: {
    fontSize: "12px",
    color: "#888",
  },
};

export default PlayerProfile;

import React, { useEffect, useState } from "react";

const ChampionsPage = () => {
  const [champions, setChampions] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortDirection, setSortDirection] = useState("desc");
  const [sortBy, setSortBy] = useState("presence");
  const [patchVersion, setPatchVersion] = useState("15.7.1");
  const [championNames, setChampionNames] = useState({});

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
  }, []);

  // Fetch champions and matches data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch champions data
        const championsResponse = await fetch(
          "https://lobsterapi-f663d2b5d447.herokuapp.com/api/champions"
        );
        const championsData = await championsResponse.json();
        setChampions(championsData);

        // Fetch matches data
        const matchesResponse = await fetch(
          "https://lobsterapi-f663d2b5d447.herokuapp.com/api/matches"
        );
        const matchesData = await matchesResponse.json();
        setMatches(matchesData);

        // Fetch champion names from Data Dragon API
        const fetchChampionNames = async () => {
          const url = `https://ddragon.leagueoflegends.com/cdn/${patchVersion}/data/en_US/champion.json`;
          const response = await fetch(url);
          const data = await response.json();
          setChampionNames(data.data); // Set the champions data (ID -> Name)
        };

        await fetchChampionNames();
        setLoading(false);
      } catch (err) {
        setError("Error fetching data.");
        setLoading(false);
      }
    };

    fetchData();
  }, [patchVersion]);

  const totalGames = matches.length;

  const calculateWinRate = (wins, gamesPlayed) =>
    gamesPlayed > 0 ? parseFloat(((wins / gamesPlayed) * 100).toFixed(2)) : 0;

  const calculatePresence = (wins, losses, bans, gamesPlayed) =>
    gamesPlayed > 0
      ? parseFloat((((wins + bans + losses) / gamesPlayed) * 100).toFixed(2))
      : 0;

  const calculatePickRate = (wins, losses, gamesPlayed) =>
    gamesPlayed > 0
      ? parseFloat((((wins + losses) / gamesPlayed) * 100).toFixed(2))
      : 0;

  const calculateBanRate = (bans, championGames) =>
    championGames > 0
      ? parseFloat(((bans / championGames) * 100).toFixed(2))
      : 0;

  const calculateGamesPlayed = (wins, losses) => wins + losses;

  const sortChampions = (champions, sortBy, sortDirection) => {
    return [...champions].sort((a, b) => {
      const presenceA = calculatePresence(a.wins, a.losses, a.bans, totalGames);
      const presenceB = calculatePresence(b.wins, b.losses, b.bans, totalGames);
      const winRateA = calculateWinRate(a.wins, a.wins + a.losses);
      const winRateB = calculateWinRate(b.wins, b.wins + b.losses);
      const pickRateA = calculatePickRate(a.wins, a.losses, totalGames);
      const pickRateB = calculatePickRate(b.wins, b.losses, totalGames);
      const banRateA = calculateBanRate(a.bans, totalGames);
      const banRateB = calculateBanRate(b.bans, totalGames);
      const gamesPlayedA = calculateGamesPlayed(a.wins, a.losses);
      const gamesPlayedB = calculateGamesPlayed(b.wins, b.losses);

      const keyMap = {
        presence: [presenceA, presenceB],
        winrate: [winRateA, winRateB],
        pickrate: [pickRateA, pickRateB],
        banrate: [banRateA, banRateB],
        gamesplayed: [gamesPlayedA, gamesPlayedB],
      };

      const [valA, valB] = keyMap[sortBy] || [0, 0];

      return sortDirection === "desc" ? valB - valA : valA - valB;
    });
  };

  const sortedChampions = sortChampions(champions, sortBy, sortDirection);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      setSortBy(column);
      setSortDirection("desc");
    }
  };

  const getWinRateColor = (winRate) => {
    const hue = (Math.max(0, Math.min(100, winRate)) / 100) * 120;
    return `hsl(${hue}, 100%, 50%)`;
  };

  // Helper function to map champion ID to name
  const idToName = (championId) => {
    const champion = championNames[championId];
    return champion ? champion.name : championId; // Return the name if found, else return ID
  };

  if (loading) return <p>Loading champion stats...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Champions Stats</h1>
      <table style={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            {["presence", "winrate", "pickrate", "banrate", "gamesplayed"].map(
              (col) => (
                <th key={col}>
                  <button
                    onClick={() => handleSort(col)}
                    style={styles.sortButton}
                  >
                    {col.charAt(0).toUpperCase() +
                      col
                        .slice(1)
                        .replace("rate", " Rate")
                        .replace("gamesplayed", "Games Played")}{" "}
                    {sortBy === col && (sortDirection === "desc" ? "↑" : "↓")}
                  </button>
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {sortedChampions.map((champion) => {
            const gamesPlayed = calculateGamesPlayed(
              champion.wins,
              champion.losses
            );
            const presence = calculatePresence(
              champion.wins,
              champion.losses,
              champion.bans,
              totalGames
            );
            const winRate = calculateWinRate(champion.wins, gamesPlayed);
            const pickRate = calculatePickRate(
              champion.wins,
              champion.losses,
              totalGames
            );
            const banRate = calculateBanRate(champion.bans, totalGames);

            return (
              <tr key={champion._id} style={styles.row}>
                <td style={{ ...styles.td, ...styles.nameCell }}>
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/${patchVersion}/img/champion/${champion.name}.png`}
                    alt={champion.name}
                    style={styles.icon}
                  />
                  {idToName(champion.name)} {/* Use idToName here */}
                </td>
                <td style={styles.td}>{presence}%</td>
                <td style={{ ...styles.td, color: getWinRateColor(winRate) }}>
                  {winRate}%
                </td>
                <td style={styles.td}>{pickRate}%</td>
                <td style={styles.td}>{banRate}%</td>
                <td style={styles.td}>{gamesPlayed}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    backgroundColor: "#1c1c1c",
    color: "#fff",
    maxWidth: "1200px",
    margin: "auto",
    minHeight: "100vh",
  },
  header: {
    fontSize: "32px",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: "20px",
    color: "#00bcd4",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "center",
  },
  sortButton: {
    background: "none",
    border: "none",
    color: "#00bcd4",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
  },
  td: {
    padding: "12px 16px",
    backgroundColor: "#333",
    color: "#fff",
    fontSize: "14px",
    borderBottom: "1px solid #444",
    verticalAlign: "middle",
  },
  row: {
    transition: "background-color 0.3s",
  },
  icon: {
    width: "32px",
    height: "32px",
    marginRight: "10px",
    borderRadius: "4px",
  },
  nameCell: {
    display: "flex",
    alignItems: "center",
    fontWeight: "bold",
  },
};

export default ChampionsPage;

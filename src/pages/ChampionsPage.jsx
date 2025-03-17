import React, { useEffect, useState } from "react";

const ChampionsPage = () => {
  const [champions, setChampions] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortDirection, setSortDirection] = useState("desc");
  const [sortBy, setSortBy] = useState("presence");

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
        setLoading(false);
      } catch (err) {
        setError("Error fetching data.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const idToNameAndIcon = async (championId) => {
    const url =
      "https://ddragon.leagueoflegends.com/cdn/15.5.1/data/en_US/champion.json";
    try {
      const response = await fetch(url);
      const data = await response.json();
      const champions = data.data;

      if (champions[championId]) {
        const champion = champions[championId];
        const championIcon = `https://ddragon.leagueoflegends.com/cdn/15.5.1/img/champion/${championId}.png`;
        return { name: champion.name, icon: championIcon };
      } else {
        console.error(`Champion with ID ${championId} not found`);
        return null;
      }
    } catch (error) {
      console.error("Error fetching champion data:", error);
      return null;
    }
  };

  if (loading) {
    return <p>Loading champion stats...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const totalGames = matches.length;

  const calculateWinRate = (wins, gamesPlayed) => {
    return gamesPlayed > 0
      ? parseFloat(((wins / gamesPlayed) * 100).toFixed(2))
      : 0;
  };

  const calculatePresence = (wins, losses, bans, gamesPlayed) => {
    return gamesPlayed > 0
      ? parseFloat((((wins + bans + losses) / gamesPlayed) * 100).toFixed(2))
      : 0;
  };

  const calculatePickRate = (wins, losses, gamesPlayed) => {
    return gamesPlayed > 0
      ? parseFloat((((wins + losses) / gamesPlayed) * 100).toFixed(2))
      : 0;
  };

  const calculateBanRate = (bans, championGames) => {
    return championGames > 0
      ? parseFloat(((bans / championGames) * 100).toFixed(2))
      : 0;
  };

  const calculateGamesPlayed = (wins, losses) => {
    return wins + losses;
  };

  const sortChampions = (champions, sortBy, sortDirection) => {
    return champions.sort((a, b) => {
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

      if (sortBy === "presence") {
        return sortDirection === "desc"
          ? presenceB - presenceA
          : presenceA - presenceB;
      } else if (sortBy === "winrate") {
        return sortDirection === "desc"
          ? winRateB - winRateA
          : winRateA - winRateB;
      } else if (sortBy === "pickrate") {
        return sortDirection === "desc"
          ? pickRateB - pickRateA
          : pickRateA - pickRateB;
      } else if (sortBy === "banrate") {
        return sortDirection === "desc"
          ? banRateB - banRateA
          : banRateA - banRateB;
      } else if (sortBy === "gamesplayed") {
        return sortDirection === "desc"
          ? gamesPlayedB - gamesPlayedA
          : gamesPlayedA - gamesPlayedB;
      }
      return 0;
    });
  };

  const sortedChampions = sortChampions(champions, sortBy, sortDirection);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection((prevDirection) =>
        prevDirection === "desc" ? "asc" : "desc"
      );
    } else {
      setSortBy(column);
      setSortDirection("desc");
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Champions Stats</h1>
      <table style={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>
              <button
                onClick={() => handleSort("presence")}
                style={styles.sortButton}
              >
                Presence{" "}
                {sortBy === "presence" &&
                  (sortDirection === "desc" ? "↑" : "↓")}
              </button>
            </th>
            <th>
              <button
                onClick={() => handleSort("winrate")}
                style={styles.sortButton}
              >
                Winrate{" "}
                {sortBy === "winrate" && (sortDirection === "desc" ? "↑" : "↓")}
              </button>
            </th>
            <th>
              <button
                onClick={() => handleSort("pickrate")}
                style={styles.sortButton}
              >
                Picked %{" "}
                {sortBy === "pickrate" &&
                  (sortDirection === "desc" ? "↑" : "↓")}
              </button>
            </th>
            <th>
              <button
                onClick={() => handleSort("banrate")}
                style={styles.sortButton}
              >
                Banned %{" "}
                {sortBy === "banrate" && (sortDirection === "desc" ? "↑" : "↓")}
              </button>
            </th>
            <th>
              <button
                onClick={() => handleSort("gamesplayed")}
                style={styles.sortButton}
              >
                Games Played{" "}
                {sortBy === "gamesplayed" &&
                  (sortDirection === "desc" ? "↑" : "↓")}
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedChampions.map((champion) => {
            const totalGamesPlayed = champion.wins + champion.losses;
            const presence = calculatePresence(
              champion.wins,
              champion.losses,
              champion.bans,
              totalGames
            );
            const winRate = calculateWinRate(champion.wins, totalGamesPlayed);
            const pickRate = calculatePickRate(
              champion.wins,
              champion.losses,
              totalGames
            );
            const banRate = calculateBanRate(champion.bans, totalGames);

            return (
              <tr key={champion._id}>
                <td>
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/15.5.1/img/champion/${champion.name}.png`}
                    alt={`${champion.name} icon`}
                    style={{
                      width: "30px",
                      height: "30px",
                      marginRight: "10px",
                    }}
                  />
                  {champion.name}
                </td>
                <td>{presence}%</td>
                <td>{winRate}%</td>
                <td>{pickRate}%</td>
                <td>{banRate}%</td>
                <td>{totalGamesPlayed}</td>
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
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    backgroundColor: "#222",
    color: "#fff",
    borderRadius: "8px",
    boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.3)",
    maxWidth: "1200px",
    margin: "auto",
    minHeight: "100vh",
  },
  header: {
    fontSize: "28px",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: "20px",
    color: "#00bcd4",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "#333",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
  },
  th: {
    backgroundColor: "#444",
    color: "#fff",
    padding: "12px 20px",
    textAlign: "center",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  td: {
    backgroundColor: "#444",
    padding: "12px 20px",
    textAlign: "center",
    fontSize: "14px",
    color: "#fff",
  },
  sortButton: {
    background: "none",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    fontSize: "16px",
    transition: "color 0.3s ease",
  },
};

export default ChampionsPage;

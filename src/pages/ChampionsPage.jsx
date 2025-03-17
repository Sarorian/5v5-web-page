import React, { useEffect, useState } from "react";

const ChampionsPage = () => {
  const [champions, setChampions] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const idToName = async (championId) => {
    const url =
      "https://ddragon.leagueoflegends.com/cdn/15.5.1/data/en_US/champion.json";
    try {
      // Fetch the champion data from the given URL
      const response = await fetch(url);
      const data = await response.json();

      const champions = data.data; // Get the champions data from the response

      // Check if the championId exists and return the champion name
      if (champions[championId]) {
        return champions[championId].name;
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
  console.log(matches.length);

  const calculateWinRate = (wins, gamesPlayed) => {
    return gamesPlayed > 0
      ? parseFloat(((wins / gamesPlayed) * 100).toFixed(2)) // Strips trailing zeroes if the value is a whole number
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

  // Sort champions by highest presence first
  const sortedChampions = champions.sort((a, b) => {
    const presenceA = calculatePresence(a.wins, a.losses, a.bans, totalGames);
    const presenceB = calculatePresence(b.wins, b.losses, b.bans, totalGames);
    return presenceB - presenceA; // Sort in descending order
  });

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Champions Stats</h1>
      <table style={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Presence</th>
            <th>Winrate</th>
            <th>Picked %</th>
            <th>Banned %</th>
            <th>Games Played</th>
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
            ); // Picked % calculation
            const banRate = calculateBanRate(champion.bans, totalGames); // Banned % calculation

            return (
              <tr key={champion._id}>
                <td>{champion.name}</td>
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
    padding: "20px",
    backgroundColor: "#222",
    color: "#fff",
  },
  header: {
    fontSize: "24px",
    fontWeight: "bold",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px",
  },
  th: {
    backgroundColor: "#333",
    padding: "10px",
    textAlign: "left",
  },
  td: {
    padding: "10px",
    textAlign: "left",
  },
};

export default ChampionsPage;

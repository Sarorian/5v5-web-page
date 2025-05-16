import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const PlayersPage = () => {
  const [players, setPlayers] = useState([]);
  const [allMatches, setAllMatches] = useState([]);

  const [leader, setLeader] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);

  useEffect(() => {
    const fetchMatchesAndPlayers = async () => {
      try {
        const matchesResponse = await fetch(
          "https://lobsterapi-f663d2b5d447.herokuapp.com/api/matches"
        );
        const allMatches = await matchesResponse.json();

        // Sort matches by Season and Game
        allMatches.sort((a, b) => {
          if (a.season !== b.season) return a.season - b.season;
          return a.game - b.game; // Assuming 'game' is a unique identifier per season
        });

        // Group matches into seasons (50 games per season)
        let seasons = [];
        for (let i = 0; i < allMatches.length; i += 50) {
          seasons.push(allMatches.slice(i, i + 50));
        }

        seasons.reverse(); // Reverse so season 0 is the latest
        setSeasons(seasons);
        setSelectedSeason(0); // Default to the latest season

        console.log("Reversed Seasons:", seasons);

        // Fetch all players
        const playersResponse = await fetch(
          "https://lobsterapi-f663d2b5d447.herokuapp.com/api/players"
        );
        const playersData = await playersResponse.json();

        // Filter player stats based on the latest season
        const filteredPlayers = calculateSeasonStats(
          playersData,
          seasons[0] || []
        );
        setPlayers(filteredPlayers);
        setLeader(filteredPlayers[0] || null);
        setAllMatches(allMatches);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchMatchesAndPlayers();
  }, []);

  useEffect(() => {
    if (seasons.length === 0 && selectedSeason !== -1) return;

    const fetchPlayers = async () => {
      try {
        const playersResponse = await fetch(
          "https://lobsterapi-f663d2b5d447.herokuapp.com/api/players"
        );
        const playersData = await playersResponse.json();

        const matchesToUse =
          selectedSeason === -1 ? allMatches : seasons[selectedSeason] || [];

        const filteredPlayers = calculateSeasonStats(playersData, matchesToUse);
        setPlayers(filteredPlayers);
        setLeader(filteredPlayers[0] || null);
      } catch (error) {
        console.error("Error fetching players:", error);
      }
    };

    fetchPlayers();
  }, [selectedSeason, seasons, allMatches]);

  const calculateSeasonStats = (playersData, seasonMatches) => {
    return playersData
      .map((player) => {
        let wins = 0,
          losses = 0,
          kills = 0,
          deaths = 0,
          assists = 0;

        for (const match of seasonMatches) {
          const playerMatchData = [
            ...match.winningTeam,
            ...match.losingTeam,
          ].find((p) => p.playerName === player.gameName);
          if (!playerMatchData) continue;

          if (match.winningTeam.some((p) => p.playerName === player.gameName)) {
            wins += 1;
          } else {
            losses += 1;
          }
          kills += playerMatchData.kills;
          deaths += playerMatchData.deaths;
          assists += playerMatchData.assists;
        }

        const gamesPlayed = wins + losses;
        if (gamesPlayed === 0) return null; // Skip player

        const points = (wins / gamesPlayed) * wins;
        const kda =
          deaths > 0
            ? ((kills + assists) / deaths).toFixed(2)
            : kills + assists;

        return { ...player, wins, losses, kills, deaths, assists, points, kda };
      })
      .filter((player) => player !== null) // Exclude players with 0 games
      .sort((a, b) => b.points - a.points);
  };

  const getChampionSplash = (championName) => {
    return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championName}_0.jpg`;
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🏆 Players Leaderboard</h1>

      {/* Season Dropdown */}
      <select
        value={selectedSeason} // <-- Add this
        onChange={(e) => setSelectedSeason(parseInt(e.target.value))}
        style={styles.dropdown}
      >
        <option value={-1}>Overall (All Seasons)</option>
        {seasons.map((_, index) => (
          <option key={index} value={index}>
            Season {seasons.length - index} {/* Reverse numbered for display */}
          </option>
        ))}
      </select>

      {/* Games Played for selected season */}
      <p style={{ marginBottom: "20px" }}>
        Games Played:{" "}
        {selectedSeason === -1
          ? allMatches.length
          : seasons[selectedSeason]?.length || 0}
      </p>

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
              KDA: {leader.kda} | Wins: {leader.wins}, Losses: {leader.losses}
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
              Wins: {player.wins} | Losses: {player.losses}
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
  dropdown: {
    padding: "10px",
    fontSize: "1rem",
    marginBottom: "20px",
    borderRadius: "5px",
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
  link: {
    color: "#FFD700",
    textDecoration: "none",
    fontWeight: "bold",
    transition: "0.3s",
  },
};

export default PlayersPage;

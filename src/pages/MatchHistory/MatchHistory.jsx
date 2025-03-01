import React, { useEffect, useState } from "react";
import axios from "axios";
import "./MatchHistory.css";

// Fetch the latest patch version
async function fetchPatch() {
  try {
    const response = await fetch(
      "https://ddragon.leagueoflegends.com/api/versions.json"
    );
    const data = await response.json();
    return data[0]; // Latest patch version
  } catch (error) {
    console.error("Error fetching patch version:", error);
  }
}

// Fetch the list of champions for the latest patch
async function fetchChampions() {
  const patch = await fetchPatch();
  if (!patch) return [];

  try {
    const response = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/${patch}/data/en_US/champion.json`
    );
    const data = await response.json();
    return Object.keys(data.data); // Champion names in the current patch
  } catch (error) {
    console.error("Error fetching champions:", error);
    return [];
  }
}

// Fetch champion splash art URL for a given champion
async function fetchChampionSplashArt(champion) {
  const patch = await fetchPatch();
  if (!patch) return null;

  try {
    // Splash art URL construction
    const splashArtUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion}_0.jpg`;
    return splashArtUrl;
  } catch (error) {
    console.error(`Error fetching splash art for ${champion}:`, error);
    return null;
  }
}

// Fetch splash arts for all players in a match
async function getMatchSplashArts(match) {
  const champions = await fetchChampions(); // Get all champions in the latest patch

  // Fetch splash art for each player in the match (both winning and losing teams)
  const splashArts = [];
  const teams = [...match.winningTeam, ...match.losingTeam]; // Combine both teams

  for (const player of teams) {
    const { champion } = player; // Player's champion
    if (champions.includes(champion)) {
      const splashArtUrl = await fetchChampionSplashArt(champion); // Get splash art
      splashArts.push({
        playerName: player.playerName,
        champion,
        splashArtUrl,
      });
    }
  }

  return splashArts; // Return an array of splash arts for each player
}

// Main MatchHistory component
const MatchHistory = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matchSplashArts, setMatchSplashArts] = useState([]);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await axios.get(
          "https://lobsterapi-f663d2b5d447.herokuapp.com/api/matches"
        );
        setMatches(response.data);
      } catch (error) {
        console.error("Error fetching match data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  useEffect(() => {
    const fetchSplashArts = async () => {
      const allSplashArts = [];
      for (const match of matches) {
        const arts = await getMatchSplashArts(match); // Get splash arts for each match
        allSplashArts.push({ matchId: match._id, splashArts: arts });
      }
      setMatchSplashArts(allSplashArts); // Store all splash arts
    };

    if (matches.length > 0) {
      fetchSplashArts(); // Fetch splash arts when matches data is loaded
    }
  }, [matches]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="match-history-container">
      {matches.map((match) => {
        // Find the splash arts for the current match
        const splashArtsForMatch = matchSplashArts.find(
          (arts) => arts.matchId === match._id
        );

        return (
          <div key={match._id} className="match-card">
            {/* Minimized View (Horizontal Bar) */}
            <div className="match-minimized">
              <span className="match-date">{match.date}</span>
              <span className="match-time">{match.time}</span>
              <div className="team">
                <span className="winning-team">
                  Winning:{" "}
                  {match.winningTeam.map((player, index) => (
                    <span key={index}>
                      {player.playerName}
                      {index < match.winningTeam.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </span>
              </div>
              <div className="team">
                <span className="losing-team">
                  Losing:{" "}
                  {match.losingTeam.map((player, index) => (
                    <span key={index}>
                      {player.playerName}
                      {index < match.losingTeam.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </span>
              </div>
            </div>

            {/* Expanded View on Hover */}
            <div className="match-info">
              <p>
                <strong>Bans:</strong> {match.bans.join(", ")}
              </p>

              <div className="team-info">
                <div className="team winning-team-info">
                  <h4>Winning Team</h4>
                  {match.winningTeam.map((player, index) => (
                    <div
                      key={index}
                      className="player-info"
                      style={{
                        backgroundImage: `url(${
                          splashArtsForMatch?.splashArts.find(
                            (art) => art.playerName === player.playerName
                          )?.splashArtUrl
                        })`,
                      }}
                    >
                      <p className="player-name">{player.playerName}</p>
                      <p className="player-kda">
                        {player.kills}/{player.deaths}/{player.assists}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="team losing-team-info">
                  <h4>Losing Team</h4>
                  {match.losingTeam.map((player, index) => (
                    <div
                      key={index}
                      className="player-info"
                      style={{
                        backgroundImage: `url(${
                          splashArtsForMatch?.splashArts.find(
                            (art) => art.playerName === player.playerName
                          )?.splashArtUrl
                        })`,
                      }}
                    >
                      <p className="player-name">{player.playerName}</p>
                      <p className="player-kda">
                        {player.kills}/{player.deaths}/{player.assists}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MatchHistory;

import TeamSelect from "../components/teamSelection";
import SeasonAvailabilityMatrix from "../components/seasonAvailabilityMatrix";
import SeasonProgressionChart from "../components/seasonProgressionChart";
import { useEffect, useState } from "react";
import "./seasons.css";

export default function Seasons() {
    const [teams, setTeams] = useState([]);
    const [seasonStats, setSeasonStats] = useState([]);

    const handleTeamsChange = (newTeams) => {
        setTeams(newTeams);
    };

    useEffect(() => {
        const fetchSeasons = async () => {
            if (!teams || teams.length === 0) {
                setSeasonStats([]);
                return;
            }

            try {
                const teamIds = teams.map((team) => team.id);
                const requestBody = {
                    ids: teamIds,
                };

                const response = await fetch("/api/seasons/teams", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestBody),
                });
                const data = await response.json();
                console.log(data);
                setSeasonStats(data);
            } catch (error) {
                console.error("Error fetching seasons for team(s): ", error);
            }
        };

        fetchSeasons();
    }, [teams]);

    return (
        <div className="seasons-container">
            {/* Team Selection Section */}
            <div className="section">
                <TeamSelect onTeamsChange={handleTeamsChange} />
                <div className="divider"></div>
            </div>

            {/* Season Availability Title */}
            <div className="section-header">
                <h2 className="page-title mx-auto">Season Availability</h2>
            </div>

            {/* Availability Matrix */}
            {seasonStats.length > 0 ? (
                <SeasonAvailabilityMatrix data={seasonStats} />
            ) : (
                <p className="empty-state">Select teams to view season availability</p>
            )}

            {/* Season Progression Chart */}
            {seasonStats.length > 0 && (
                <>
                    <div className="divider"></div>
                    <div className="section-header">
                        <h2 className="page-title mx-auto">Season Progression</h2>
                    </div>
                    <SeasonProgressionChart data={seasonStats} />
                </>
            )}
        </div>
    );
}
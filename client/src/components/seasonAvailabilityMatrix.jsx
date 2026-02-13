import useIsMobile from '../hooks/useIsMobile';
import "./seasonAvailabilityMatrix.css";

/**
 * SeasonAvailabilityMatrix
 * Displays a grid showing which teams have data for which seasons
 * Desktop: teams as rows, seasons as columns
 * Mobile: seasons as rows, teams as columns (transposed)
 * ● = data available, ○ = no data
 */
export default function SeasonAvailabilityMatrix({ data }) {
    const isMobile = useIsMobile(1024);

    if (!data || data.length === 0) {
        return null;
    }

    // Extract unique seasons, sorted chronologically
    const allSeasons = [...new Set(data.map((d) => d.season))].sort();

    // Extract unique teams with their league info
    const teamsMap = new Map();
    data.forEach((d) => {
        if (!teamsMap.has(d.team_id)) {
            teamsMap.set(d.team_id, {
                id: d.team_id,
                name: d.team_full_name,
                abbreviation: d.team_abbreviation || d.team_name,
                league: d.league_name,
            });
        }
    });
    const teams = [...teamsMap.values()];

    // Build availability lookup: { teamId: Set of seasons they have data for }
    const availability = new Map();
    data.forEach((d) => {
        if (!availability.has(d.team_id)) {
            availability.set(d.team_id, new Set());
        }
        availability.get(d.team_id).add(d.season);
    });

    // Format season for display: "2017_2018" → "17/18"
    const formatSeason = (season) => {
        const [start, end] = season.split("_");
        return `${start.slice(2)}/${end.slice(2)}`;
    };

    // ── Mobile: transposed layout (seasons = rows, teams = columns) ──
    if (isMobile) {
        return (
            <div className="availability-matrix availability-matrix--mobile">
                <div className="matrix-container">
                    <table>
                        <thead>
                            <tr>
                                <th className="season-col-header">Season</th>
                                {teams.map((team) => (
                                    <th key={team.id} className="team-col-header">
                                        {team.abbreviation}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {allSeasons.map((season) => (
                                <tr key={season}>
                                    <td className="season-row-label">
                                        {formatSeason(season)}
                                    </td>
                                    {teams.map((team) => (
                                        <td key={team.id} className="availability-cell">
                                            {availability.get(team.id).has(season) ? (
                                                <span className="available">●</span>
                                            ) : (
                                                <span className="unavailable">○</span>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    // ── Desktop: original layout (teams = rows, seasons = columns) ──
    return (
        <div className="availability-matrix">
            <div className="matrix-container">
                <table>
                    <thead>
                        <tr>
                            <th className="team-header">Team</th>
                            {allSeasons.map((season) => (
                                <th key={season} className="season-header">
                                    {formatSeason(season)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {teams.map((team) => (
                            <tr key={team.id}>
                                <td className="team-label">
                                    {team.name}{" "}
                                    <span className="league-tag">
                                        ({team.league})
                                    </span>
                                </td>
                                {allSeasons.map((season) => (
                                    <td key={season} className="availability-cell">
                                        {availability.get(team.id).has(season) ? (
                                            <span className="available">●</span>
                                        ) : (
                                            <span className="unavailable">○</span>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

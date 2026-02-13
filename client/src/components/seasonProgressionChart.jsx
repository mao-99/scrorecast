import { useState, useMemo } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import useIsMobile from '../hooks/useIsMobile';
import "./seasonProgressionChart.css";

// Varied color palette - blue, deep red, and orange tones for better distinction
const TEAM_COLORS = [
    "#3b82f6", // blue
    "#dc2626", // red
    "#f97316", // orange
    "#06b6d4", // cyan
    "#b91c1c", // dark red
    "#ea580c", // dark orange
    "#0ea5e9", // sky blue
    "#ef4444", // light red
    "#fb923c", // light orange
    "#0284c7", // darker blue
];

// Available metrics for the dropdown - organized by category
const METRICS = [
    // Performance & Points
    { key: "points_per_game", label: "Points Per Game", category: "Performance" },
    { key: "points", label: "Total Points", category: "Performance" },
    { key: "win_percentage", label: "Win %", category: "Performance", isPercentage: true },
    { key: "wins", label: "Wins", category: "Performance" },
    { key: "draws", label: "Draws", category: "Performance" },
    { key: "losses", label: "Losses", category: "Performance" },
    { key: "matches_played", label: "Matches Played", category: "Performance" },

    // Goals
    { key: "goals_per_game", label: "Goals Per Game", category: "Goals" },
    { key: "goals_conceded_per_game", label: "Goals Conceded Per Game", category: "Goals" },
    { key: "goals_for", label: "Goals Scored", category: "Goals" },
    { key: "goals_against", label: "Goals Conceded", category: "Goals" },
    { key: "goal_difference", label: "Goal Difference", category: "Goals" },

    // Defensive
    { key: "clean_sheet_percentage", label: "Clean Sheet %", category: "Defensive", isPercentage: true },
    { key: "clean_sheets", label: "Clean Sheets", category: "Defensive" },
    { key: "failed_to_score", label: "Failed to Score", category: "Defensive" },

    // Home Performance
    { key: "home_win_percentage", label: "Home Win %", category: "Home", isPercentage: true },
    { key: "home_wins", label: "Home Wins", category: "Home" },
    { key: "home_draws", label: "Home Draws", category: "Home" },
    { key: "home_losses", label: "Home Losses", category: "Home" },
    { key: "home_matches", label: "Home Matches", category: "Home" },
    { key: "home_goals_for", label: "Home Goals Scored", category: "Home" },
    { key: "home_goals_against", label: "Home Goals Conceded", category: "Home" },

    // Away Performance
    { key: "away_win_percentage", label: "Away Win %", category: "Away", isPercentage: true },
    { key: "away_wins", label: "Away Wins", category: "Away" },
    { key: "away_draws", label: "Away Draws", category: "Away" },
    { key: "away_losses", label: "Away Losses", category: "Away" },
    { key: "away_matches", label: "Away Matches", category: "Away" },
    { key: "away_goals_for", label: "Away Goals Scored", category: "Away" },
    { key: "away_goals_against", label: "Away Goals Conceded", category: "Away" },
];

// Group metrics by category for the dropdown
const METRIC_CATEGORIES = [...new Set(METRICS.map((m) => m.category))];

export default function SeasonProgressionChart({ data }) {
    const [selectedMetric, setSelectedMetric] = useState("points_per_game");
    const isMobile = useIsMobile();

    // Extract unique seasons and teams from data
    const { allSeasons, teams, availability, matchCountIssues, inProgressSeason } =
        useMemo(() => {
            if (!data || data.length === 0) {
                return {
                    allSeasons: [],
                    teams: [],
                    availability: new Map(),
                    matchCountIssues: [],
                    inProgressSeason: null,
                };
            }

            // Unique seasons sorted chronologically
            const allSeasons = [...new Set(data.map((d) => d.season))].sort();

            // Unique teams with their info
            const teamsMap = new Map();
            data.forEach((d) => {
                if (!teamsMap.has(d.team_id)) {
                    teamsMap.set(d.team_id, {
                        id: d.team_id,
                        name: d.team_full_name,
                        shortName: d.team_name,
                        league: d.league_name,
                    });
                }
            });
            const teams = [...teamsMap.values()];

            // Availability lookup
            const availability = new Map();
            data.forEach((d) => {
                if (!availability.has(d.team_id)) {
                    availability.set(d.team_id, new Set());
                }
                availability.get(d.team_id).add(d.season);
            });

            // Detect match count discrepancies per season
            const matchCountIssues = allSeasons
                .map((season) => {
                    const seasonData = data.filter((d) => d.season === season);
                    const counts = seasonData.map((d) => d.matches_played);
                    const uniqueCounts = [...new Set(counts)];

                    return {
                        season,
                        hasDiscrepancy: uniqueCounts.length > 1,
                        counts: seasonData.map((d) => ({
                            team: d.team_full_name,
                            matches: d.matches_played,
                        })),
                    };
                })
                .filter((s) => s.hasDiscrepancy);

            // Detect in-progress season: only the most recent season can be in progress
            // Compare its max match count to the previous season's max match count
            let inProgressSeason = null;
            if (allSeasons.length >= 2) {
                const mostRecentSeason = allSeasons[allSeasons.length - 1];
                const previousSeason = allSeasons[allSeasons.length - 2];

                const recentSeasonData = data.filter((d) => d.season === mostRecentSeason);
                const previousSeasonData = data.filter((d) => d.season === previousSeason);

                const maxRecentMatches = Math.max(
                    ...recentSeasonData.map((d) => d.matches_played)
                );
                const maxPreviousMatches = Math.max(
                    ...previousSeasonData.map((d) => d.matches_played)
                );

                if (maxRecentMatches < maxPreviousMatches) {
                    inProgressSeason = mostRecentSeason;
                }
            }

            return { allSeasons, teams, availability, matchCountIssues, inProgressSeason };
        }, [data]);

    // Transform data for Recharts based on selected metric
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];

        return allSeasons.map((season) => {
            const point = { season };

            teams.forEach((team) => {
                const match = data.find(
                    (d) => d.team_id === team.id && d.season === season
                );
                point[team.name] = match ? Number(match[selectedMetric]) : null;
                // Store matches played for tooltip
                point[`${team.name}_matches`] = match ? match.matches_played : null;
            });

            point.isInProgress = season === inProgressSeason;

            return point;
        });
    }, [data, allSeasons, teams, selectedMetric, inProgressSeason]);

    // Get current metric config
    const currentMetric = METRICS.find((m) => m.key === selectedMetric);

    // Format season for display: "2017_2018" → "17/18"
    const formatSeason = (season) => {
        const [start, end] = season.split("_");
        return `${start.slice(2)}/${end.slice(2)}`;
    };

    // Format value based on metric type
    const formatValue = (value) => {
        if (value === null || value === undefined) return "N/A";
        if (currentMetric?.isPercentage) return `${value.toFixed(1)}%`;
        return value.toFixed(2);
    };

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const isInProgress = chartData.find((d) => d.season === label)?.isInProgress;

            return (
                <div className="chart-tooltip">
                    <p className="tooltip-season">
                        {formatSeason(label)}
                        {isInProgress && (
                            <span className="in-progress-badge">In Progress</span>
                        )}
                    </p>
                    {payload.map((entry, index) => (
                        <div key={index} className="tooltip-row">
                            <span
                                className="tooltip-dot"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="tooltip-team">{entry.name}:</span>
                            <span className="tooltip-value">{formatValue(entry.value)}</span>
                            {chartData.find((d) => d.season === label)?.[
                                `${entry.name}_matches`
                            ] && (
                                <span className="tooltip-matches">
                                    (
                                    {
                                        chartData.find((d) => d.season === label)?.[
                                            `${entry.name}_matches`
                                        ]
                                    }{" "}
                                    matches)
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (!data || data.length === 0) {
        return null;
    }

    return (
        <div className="season-chart-container">
            {/* Metric Selector */}
            <div className="chart-controls">
                <label htmlFor="metric-select" className="metric-label">
                    Metric:
                </label>
                <select
                    id="metric-select"
                    className="metric-select"
                    value={selectedMetric}
                    onChange={(e) => setSelectedMetric(e.target.value)}
                >
                    {METRIC_CATEGORIES.map((category) => (
                        <optgroup key={category} label={category}>
                            {METRICS.filter((m) => m.category === category).map((metric) => (
                                <option key={metric.key} value={metric.key}>
                                    {metric.label}
                                </option>
                            ))}
                        </optgroup>
                    ))}
                </select>
            </div>

            {/* Match Count Warning */}
            {matchCountIssues.length > 0 && (
                <div className="match-warning">
                    <span className="warning-icon">⚠</span>
                    <span>
                        Some teams have different match counts in:{" "}
                        {matchCountIssues.map((issue) => formatSeason(issue.season)).join(", ")}
                    </span>
                </div>
            )}

            {/* In Progress Notice */}
            {inProgressSeason && (
                <div className="in-progress-notice">
                    <span
                        className="notice-dot"
                        style={{ backgroundColor: "#991b1b" }}
                    />
                    <span>
                        Season in progress: {formatSeason(inProgressSeason)}
                    </span>
                </div>
            )}

            {/* Chart */}
            <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={isMobile ? 280 : 400}>
                    <LineChart
                        data={chartData}
                        margin={isMobile
                            ? { top: 10, right: 8, left: -10, bottom: 10 }
                            : { top: 20, right: 30, left: 20, bottom: 20 }
                        }
                    >
                        <XAxis
                            dataKey="season"
                            tickFormatter={formatSeason}
                            stroke="#94a3b8"
                            tick={{ fill: "#94a3b8", fontSize: isMobile ? 10 : 12 }}
                            axisLine={{ stroke: "#334155" }}
                            tickLine={{ stroke: "#334155" }}
                            interval={isMobile ? 1 : 0}
                        />
                        <YAxis
                            stroke="#94a3b8"
                            tick={{ fill: "#94a3b8", fontSize: isMobile ? 10 : 12 }}
                            axisLine={{ stroke: "#334155" }}
                            tickLine={{ stroke: "#334155" }}
                            tickFormatter={(value) =>
                                currentMetric?.isPercentage ? `${value}%` : value
                            }
                            width={isMobile ? 35 : 60}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{
                                paddingTop: isMobile ? "0.5rem" : "1rem",
                            }}
                            formatter={(value) => {
                                // On mobile, find the short name for this team
                                const displayName = isMobile
                                    ? (teams.find(t => t.name === value)?.shortName || value)
                                    : value;
                                return (
                                    <span style={{ color: "#e2e8f0", fontSize: isMobile ? "0.75rem" : "0.875rem" }}>
                                        {displayName}
                                    </span>
                                );
                            }}
                        />
                        {teams.map((team, index) => (
                            <Line
                                key={team.id}
                                type="monotone"
                                dataKey={team.name}
                                stroke={TEAM_COLORS[index % TEAM_COLORS.length]}
                                strokeWidth={isMobile ? 1.5 : 2}
                                dot={{ r: isMobile ? 3 : 4, strokeWidth: isMobile ? 1.5 : 2 }}
                                activeDot={{ r: isMobile ? 5 : 6, strokeWidth: 2 }}
                                connectNulls={false}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

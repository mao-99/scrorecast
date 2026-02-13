import './statsCardList.css';

export default function StatsCardList({
    charts,
    category,
    chartModes,
    onToggleMode,
    teamsData,
    leagueAverages,
    teamColors,
    leagueAvgColors,
    extractValue,
    normalizedToRawMapping,
    validRawCharts,
}) {
    const isSingleTeam = teamsData.length === 1;

    // Format value for display
    const formatValue = (value, isPercentage) => {
        if (value === null || value === undefined) return '—';
        if (isPercentage) return `${(value * 100).toFixed(1)}%`;
        return typeof value === 'number'
            ? (Number.isInteger(value) ? value.toString() : value.toFixed(2))
            : String(value);
    };

    // Compute fill bar width as a percentage
    const computeFillPercent = (value, allValues, isPercentage) => {
        if (value === null || value === undefined) return 0;
        if (isPercentage) {
            return Math.min(Math.max(value * 100, 0), 100);
        }
        const valid = allValues.filter(v => v !== null && v !== undefined && !isNaN(v));
        if (valid.length === 0) return 0;
        const max = Math.max(...valid);
        const min = Math.min(0, ...valid);
        if (max === min) return 50;
        return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
    };

    // Resolve chart config based on current mode (raw vs normalized)
    const resolveChartConfig = (chart, mode) => {
        if (mode === 'normalized' || chart.source === 'percentages') {
            return chart;
        }
        const rawKey = normalizedToRawMapping[chart.key] || chart.key;
        const rawChart = validRawCharts.find(c => c.key === rawKey);
        return rawChart || chart;
    };

    return (
        <div className="stats-card-list">
            {charts.map((normalizedChart) => {
                const chartKey = `${category}-${normalizedChart.key}`;
                const mode = chartModes[chartKey] || 'raw';
                const isPercentageSource = normalizedChart.source === 'percentages';

                // Resolve chart config for the current mode
                const displayChart = resolveChartConfig(normalizedChart, mode);

                // Extract values for each team
                const teamEntries = teamsData.map((team, idx) => {
                    const primaryValue = extractValue(team, category, mode, displayChart);

                    // For single team: also get the other mode's value
                    let altValue = null;
                    let altLabel = null;
                    if (isSingleTeam && !isPercentageSource) {
                        if (mode === 'raw') {
                            // Alt is the normalized value
                            altValue = extractValue(team, category, 'normalized', normalizedChart);
                            altLabel = '/game';
                        } else {
                            // Alt is the raw value
                            const rawKey = normalizedToRawMapping[normalizedChart.key];
                            const rawChart = rawKey
                                ? validRawCharts.find(c => c.key === rawKey)
                                : null;
                            if (rawChart) {
                                altValue = extractValue(team, category, 'raw', rawChart);
                                altLabel = 'total';
                            }
                        }
                    }

                    return {
                        name: team.team_full_name || team.team_name,
                        value: primaryValue,
                        altValue,
                        altLabel,
                        color: teamColors[idx % teamColors.length],
                    };
                });

                // Extract league average values
                const leagueAvgEntries = leagueAverages.map((league, idx) => ({
                    name: league.league_name,
                    value: extractValue(league, category, mode, displayChart),
                    color: leagueAvgColors[idx % leagueAvgColors.length],
                }));

                // All values for fill bar range calculation
                const allValues = [
                    ...teamEntries.map(t => t.value),
                    ...leagueAvgEntries.map(l => l.value),
                ];

                return (
                    <div key={chartKey} className="stat-card-mobile">
                        {/* Card Header */}
                        <div className="stat-card-mobile-header">
                            <span className="stat-card-mobile-title">
                                {displayChart.title}
                                {displayChart.hasDisclaimer && ' *'}
                            </span>

                            {/* Per-card Raw / /Game toggle */}
                            {!isPercentageSource && (
                                <div className="stat-card-mobile-toggle">
                                    <span className={`stat-card-toggle-label ${mode === 'raw' ? 'active' : ''}`}>
                                        Raw
                                    </span>
                                    <div
                                        className="stat-card-toggle-track"
                                        onClick={() => onToggleMode(chartKey, mode)}
                                    >
                                        <div className={`stat-card-toggle-thumb ${mode === 'normalized' ? 'on' : ''}`} />
                                    </div>
                                    <span className={`stat-card-toggle-label ${mode === 'normalized' ? 'active' : ''}`}>
                                        /Game
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Card Body */}
                        <div className="stat-card-mobile-body">
                            {isSingleTeam ? (
                                /* ───── Single Team View ───── */
                                <div className="stat-card-single">
                                    {/* Primary + Alt values */}
                                    <div className="stat-card-values">
                                        <span className="stat-card-primary-value">
                                            {formatValue(teamEntries[0]?.value, displayChart.isPercentage)}
                                        </span>
                                        {teamEntries[0]?.altValue != null && (
                                            <span className="stat-card-alt-value">
                                                {formatValue(
                                                    teamEntries[0].altValue,
                                                    mode === 'raw'
                                                        ? normalizedChart.isPercentage
                                                        : displayChart.isPercentage
                                                )}
                                                <span className="stat-card-alt-label">
                                                    {' '}{teamEntries[0].altLabel}
                                                </span>
                                            </span>
                                        )}
                                    </div>

                                    {/* Fill bar */}
                                    <div className="stat-card-bar-container">
                                        <div className="stat-card-bar-track">
                                            <div
                                                className="stat-card-bar-fill"
                                                style={{
                                                    width: `${computeFillPercent(teamEntries[0]?.value, allValues, displayChart.isPercentage)}%`,
                                                    backgroundColor: teamEntries[0]?.color,
                                                }}
                                            />
                                            {/* League avg marker line */}
                                            {leagueAvgEntries.length > 0 && leagueAvgEntries[0].value != null && (
                                                <div
                                                    className="stat-card-avg-marker"
                                                    style={{
                                                        left: `${computeFillPercent(leagueAvgEntries[0].value, allValues, displayChart.isPercentage)}%`,
                                                    }}
                                                    title={`League avg: ${formatValue(leagueAvgEntries[0].value, displayChart.isPercentage)}`}
                                                />
                                            )}
                                        </div>
                                    </div>

                                    {/* League average text */}
                                    {leagueAvgEntries.map((avg, i) => (
                                        <div key={i} className="stat-card-league-avg">
                                            <span className="stat-card-avg-dot" style={{ backgroundColor: avg.color }} />
                                            {avg.name} avg: {formatValue(avg.value, displayChart.isPercentage)}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                /* ───── Multi-Team Comparison ───── */
                                <div className="stat-card-multi">
                                    {teamEntries.map((team, idx) => (
                                        <div key={idx} className="stat-card-team-row">
                                            <div className="stat-card-team-info">
                                                <span className="stat-card-team-name" style={{ color: team.color }}>
                                                    {team.name}
                                                </span>
                                                <span className="stat-card-team-value">
                                                    {formatValue(team.value, displayChart.isPercentage)}
                                                </span>
                                            </div>
                                            <div className="stat-card-bar-track">
                                                <div
                                                    className="stat-card-bar-fill"
                                                    style={{
                                                        width: `${computeFillPercent(team.value, allValues, displayChart.isPercentage)}%`,
                                                        backgroundColor: team.color,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    {/* League averages */}
                                    {leagueAvgEntries.map((avg, i) => (
                                        <div key={i} className="stat-card-league-avg">
                                            <span className="stat-card-avg-dot" style={{ backgroundColor: avg.color }} />
                                            {avg.name} avg: {formatValue(avg.value, displayChart.isPercentage)}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

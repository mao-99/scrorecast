import { useState, useEffect } from 'react';
import FilteredSeasonSelector from '../components/filteredSeasonSelector';
import RoundRangeSelector from '../components/roundRangeSelector';
import TeamSelect from '../components/teamSelection';
import StatChart from '../components/statChart';
import StatSelect from '../components/statSelect';
import TeamStatCard from '../components/teamStatCard';
import './teams.css';

// Team color palette - consistent across all charts
const TEAM_COLORS = [
    '#0ea5e9', '#06b6d4', '#0891b2', '#0284c7', 
    '#0369a1', '#0e7490', '#22d3ee', '#14b8a6',
    '#0c4a6e', '#0369a1'
];

// League average colors (vibrant red/orange spectrum for contrast)
const LEAGUE_AVG_COLORS = [
    '#ff6b6b', // coral red
    '#ff8c42', // vibrant orange
    '#ee5a6f', // rose red
    '#ff9f1c', // golden orange
    '#e63946'  // crimson
];

// Comprehensive chart configuration
const CHART_CONFIG = {
    general: {
        normalized: [
            { title: "Points Per Game", key: "points_per_game", isPercentage: false },
            { title: "Win Rate", key: "win_rate", isPercentage: true },
            { title: "Draw Rate", key: "draw_rate", isPercentage: true },
            { title: "Loss Rate", key: "loss_rate", isPercentage: true },
            { title: "Goals Per Game", key: "goals_per_game", isPercentage: false },
            { title: "Conceded Per Game", key: "conceded_per_game", isPercentage: false },
            { title: "Avg Possession", key: "avg_possession", isPercentage: true }
        ],
        raw: [
            { title: "Points", key: "points", isPercentage: false },
            { title: "Wins", key: "wins", isPercentage: false },
            { title: "Draws", key: "draws", isPercentage: false },
            { title: "Losses", key: "losses", isPercentage: false },
            { title: "Goals For", key: "goals_for", isPercentage: false },
            { title: "Goals Against", key: "goals_against", isPercentage: false },
            { title: "Goal Difference", key: "goal_difference", isPercentage: false },
            { title: "Clean Sheets", key: "clean_sheets", isPercentage: false },
            { title: "Failed to Score", key: "failed_to_score", isPercentage: false }
        ]
    },
    attacking: {
        normalized: [
            { title: "xG Per Game", key: "xg_per_game", isPercentage: false },
            { title: "Shots Per Game", key: "shots_per_game", isPercentage: false },
            { title: "Shots on Goal Per Game", key: "shots_on_goal_per_game", isPercentage: false },
            { title: "Big Chances Per Game", key: "big_chances_per_game", isPercentage: false },
            { title: "Corners Per Game", key: "corners_per_game", isPercentage: false },
            { title: "Touches in Box Per Game", key: "touches_in_box_per_game", isPercentage: false },
            { title: "Offsides Per Game", key: "offsides_per_game", isPercentage: false },
            { title: "Shot Accuracy *", key: "shot_accuracy", isPercentage: true, source: "percentages", hasDisclaimer: true },
            { title: "Conversion Rate *", key: "conversion_rate", isPercentage: true, source: "percentages", hasDisclaimer: true },
            { title: "Goal Efficiency *", key: "goal_efficiency", isPercentage: true, source: "percentages", hasDisclaimer: true },
            { title: "xG Efficiency *", key: "xg_efficiency", isPercentage: false, source: "percentages", hasDisclaimer: true },
            { title: "xG Difference *", key: "xg_difference", isPercentage: false, source: "percentages", hasDisclaimer: true }
        ],
        raw: [
            { title: "Shots", key: "shots", isPercentage: false },
            { title: "Shots on Goal", key: "shots_on_goal", isPercentage: false },
            { title: "Shots off Goal", key: "shots_off_goal", isPercentage: false },
            { title: "xG", key: "xg", isPercentage: false },
            { title: "Corner Kicks", key: "corner_kicks", isPercentage: false },
            { title: "Offsides", key: "offsides", isPercentage: false },
            { title: "Blocked Shots", key: "blocked_shots", isPercentage: false },
            { title: "Big Chances", key: "big_chances", isPercentage: false },
            { title: "Shots Inside Box", key: "shots_inside_box", isPercentage: false },
            { title: "Shots Outside Box", key: "shots_outside_box", isPercentage: false },
            { title: "Hit Woodwork", key: "hit_woodwork", isPercentage: false },
            { title: "Free Kicks", key: "free_kicks", isPercentage: false },
            { title: "Throw Ins", key: "throw_ins", isPercentage: false },
            { title: "Touches in Opposition Box", key: "touches_in_opposition_box", isPercentage: false }
        ]
    },
    defensive: {
        normalized: [
            { title: "Saves Per Game", key: "saves_per_game", isPercentage: false },
            { title: "Tackles Per Game", key: "tackles_per_game", isPercentage: false },
            { title: "Interceptions Per Game", key: "interceptions_per_game", isPercentage: false },
            { title: "Clearances Per Game", key: "clearances_per_game", isPercentage: false },
            { title: "Fouls Per Game", key: "fouls_per_game", isPercentage: false },
            { title: "Yellows Per Game", key: "yellows_per_game", isPercentage: false },
            { title: "Tackle Success Rate *", key: "tackle_success_rate", isPercentage: true, source: "percentages", hasDisclaimer: true }
        ],
        raw: [
            { title: "Fouls", key: "fouls", isPercentage: false },
            { title: "Goalkeeper Saves", key: "goalkeeper_saves", isPercentage: false },
            { title: "Yellow Cards", key: "yellow_cards", isPercentage: false },
            { title: "Red Cards", key: "red_cards", isPercentage: false },
            { title: "Clearances", key: "clearances", isPercentage: false },
            { title: "Interceptions", key: "interceptions", isPercentage: false },
            { title: "Tackles Attempted", key: "tackles_attempted", isPercentage: false },
            { title: "Tackles Won", key: "tackles_won", isPercentage: false }
        ]
    },
    passing: {
        normalized: [
            { title: "Pass Accuracy *", key: "pass_accuracy", isPercentage: true, source: "percentages", hasDisclaimer: true },
            { title: "Passes Per Game", key: "passes_per_game", isPercentage: false },
            { title: "Passes Completed Per Game", key: "passes_completed_per_game", isPercentage: false },
            { title: "Final Third Passes Per Game", key: "final_third_passes_per_game", isPercentage: false },
            { title: "Final Third Pass Accuracy *", key: "final_third_pass_accuracy", isPercentage: true, source: "percentages", hasDisclaimer: true },
            { title: "Crosses Per Game", key: "crosses_per_game", isPercentage: false },
            { title: "Cross Accuracy *", key: "cross_accuracy", isPercentage: true, source: "percentages", hasDisclaimer: true }
        ],
        raw: [
            { title: "Passes Attempted", key: "passes_attempted", isPercentage: false },
            { title: "Passes Completed", key: "passes_completed", isPercentage: false },
            { title: "Final Third Passes Attempted", key: "final_third_passes_attempted", isPercentage: false },
            { title: "Final Third Passes Completed", key: "final_third_passes_completed", isPercentage: false },
            { title: "Crosses Attempted", key: "crosses_attempted", isPercentage: false },
            { title: "Crosses Completed", key: "crosses_completed", isPercentage: false }
        ]
    }
};

export default function Teams() {
    const [selectedTeams, setSelectedTeams] = useState([]);
    const [selectedSeasons, setSelectedSeasons] = useState([]);
    const [isRoundFilterEnabled, setIsRoundFilterEnabled] = useState(false);
    const [roundRange, setRoundRange] = useState({ start: null, end: null });
    const [teamsStatsData, setTeamsStatsData] = useState([]);
    const [leagueAverages, setLeagueAverages] = useState([]);
    const [seasons, setSeasons] = useState([]);
    const [statType, setStatType] = useState('general');
    const [chartModes, setChartModes] = useState({}); // Track raw/normalized per chart
    const [visibleChartCount, setVisibleChartCount] = useState(6); // Progressive loading


    const handleSeasonChange = (seasons) => {
        setSelectedSeasons(seasons);
    };

    const handleRoundRangeChange = (range) => {
        setRoundRange(range);
    };

    const handleTeamsChange = (teams) => {
        setSelectedTeams(teams);
    };

    const handleRoundFilterToggle = () => {
        const newState = !isRoundFilterEnabled;
        setIsRoundFilterEnabled(newState);
        
        if (newState) {
            // Set default round range if not already set
            if (!roundRange.start || !roundRange.end) {
                setRoundRange({ start: 1, end: 38 });
            }
        } else {
            // Disable round filtering by setting to null
            setRoundRange({ start: null, end: null });
        }
    };

    const handleStatSelect = (type) => {
        setStatType(type);
        setVisibleChartCount(6); // Reset to 6 when switching tabs
        setChartModes({}); // Reset chart modes when switching tabs
        console.log("Stat type updated: ", type);
    };

    // Extract value from nested team data structure
    const extractValue = (team, category, type, chart) => {
        if (chart.source === 'percentages') {
            return team[category]?.percentages?.[chart.key];
        }
        return team[category]?.[type]?.[chart.key];
    };

    // Filter charts to only show stats where ALL teams have non-null values
    const getValidCharts = (category, type) => {
        const charts = CHART_CONFIG[category]?.[type] || [];
        return charts.filter(chart => {
            return teamsStatsData.every(team => {
                const value = extractValue(team, category, type, chart);
                return value !== null && value !== undefined;
            });
        });
    };

    // Prepare data for a specific chart (all teams + league averages)
    const prepareChartData = (category, type, chart) => {
        const teamData = teamsStatsData.map((team, index) => ({
            name: team.team_full_name || team.team_name,
            value: extractValue(team, category, type, chart),
            color: TEAM_COLORS[index % TEAM_COLORS.length],
            isTeam: true
        }));
        
        const leagueData = leagueAverages.map((league, index) => ({
            name: `${league.league_name} Avg`,
            value: extractValue(league, category, type, chart),
            color: LEAGUE_AVG_COLORS[index % LEAGUE_AVG_COLORS.length],
            isLeagueAverage: true,
            pattern: 'diagonal-stripes' // For visual distinction
        }));
        
        return [...teamData, ...leagueData];
    };

    // Handle toggle between raw and normalized for a specific chart
    const handleChartToggle = (chartKey, currentMode) => {
        setChartModes(prev => ({
            ...prev,
            [chartKey]: currentMode === 'raw' ? 'normalized' : 'raw'
        }));
    };

    // Load more charts (3 at a time)
    const handleLoadMore = () => {
        setVisibleChartCount(prev => prev + 3);
    };

    // Get charts to display based on current stat type
    const currentCategory = statType || 'general';
    const validNormalizedCharts = getValidCharts(currentCategory, 'normalized');
    const validRawCharts = getValidCharts(currentCategory, 'raw');
    
    // Create a mapping of normalized keys to raw keys
    const normalizedToRawMapping = {
        points_per_game: 'points',
        goals_per_game: 'goals_for',
        conceded_per_game: 'goals_against',
        win_rate: 'wins',
        draw_rate: 'draws',
        loss_rate: 'losses',
        avg_possession: 'possession',
        shots_per_game: 'shots',
        shots_on_goal_per_game: 'shots_on_goal',
        xg_per_game: 'xg',
        big_chances_per_game: 'big_chances',
        corners_per_game: 'corner_kicks',
        offsides_per_game: 'offsides',
        touches_in_box_per_game: 'touches_in_opposition_box',
        fouls_per_game: 'fouls',
        saves_per_game: 'goalkeeper_saves',
        yellows_per_game: 'yellow_cards',
        clearances_per_game: 'clearances',
        interceptions_per_game: 'interceptions',
        tackles_per_game: 'tackles_attempted',
        passes_per_game: 'passes_attempted',
        passes_completed_per_game: 'passes_completed',
        final_third_passes_per_game: 'final_third_passes_attempted',
        crosses_per_game: 'crosses_attempted'
    };
    
    // Charts to display (limited by visibleChartCount)
    const chartsToDisplay = validNormalizedCharts.slice(0, visibleChartCount);
    const hasMoreCharts = validNormalizedCharts.length > visibleChartCount;
    const hasPercentageStats = chartsToDisplay.some(chart => chart.hasDisclaimer);

    // Fetch teams statistics when filters change
    useEffect(() => {
        if (selectedSeasons.length === 0 || selectedTeams.length === 0) {
            setTeamsStatsData([]);
            return;
        }

        const fetchTeamsStats = async () => {
            try {
                const teamIds = selectedTeams.map(t => t.id);
                const requestBody = {
                    teamIds: teamIds,
                    seasons: selectedSeasons,
                    ...(isRoundFilterEnabled && roundRange.start !== null && roundRange.end !== null ? {
                        roundStart: roundRange.start,
                        roundEnd: roundRange.end
                    } : {})
                };

                const response = await fetch('/api/teams/statistics', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody)
                });
                const data = await response.json();
                console.log(data);
                setTeamsStatsData(data.teams || []);
                setLeagueAverages(data.leagueAverages || []);
            } catch (error) {
                console.error("Error fetching teams statistics:", error);
                setTeamsStatsData([]);
            }
        };

        fetchTeamsStats();
    }, [selectedSeasons, roundRange, selectedTeams, statType]);

    useEffect(() => {
        const fetchSeasons = async () => {
            try {
                const response = await fetch(`/api/teams/seasons/`, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        teamIds: selectedTeams.map(team => team.id)
                    })
                });
                const data = await response.json();
                setSeasons(data);
            } catch (err) {
                console.error("Error fetching seasons");
                setSeasons([]);
            }
        }
        fetchSeasons();
    }, [selectedTeams])

    const hasData = teamsStatsData.length > 0;

    return (
        <div className="teams-container">
            {/* Team Multi-Select */}
            <TeamSelect 
                onTeamsChange={handleTeamsChange}
            />

            { seasons.length > 0 && <div className="divider"></div>}

            {/* Season Button Group */}
            <FilteredSeasonSelector 
                onSeasonChange={handleSeasonChange}
                seasons={seasons}
            />

            {/* Round Range Filter Toggle */}
            <div className="round-filter-toggle-container">
                <span className="toggle-section-label">Round Filtering</span>
                <div className="mode-toggle-container">
                    <span className={`mode-label ${!isRoundFilterEnabled ? 'active' : ''}`}>Off</span>
                    <div 
                        className="toggle-switch"
                        onClick={handleRoundFilterToggle}
                        style={{
                            width: '36px',
                            height: '18px',
                            backgroundColor: isRoundFilterEnabled ? '#3b82f6' : '#6b7280',
                            borderRadius: '9px',
                            position: 'relative',
                            cursor: 'pointer',
                            transition: 'background-color 0.3s ease',
                            margin: '0 0.4rem'
                        }}
                    >
                        <div 
                            className="toggle-slider"
                            style={{
                                width: '14px',
                                height: '14px',
                                backgroundColor: 'white',
                                borderRadius: '50%',
                                position: 'absolute',
                                top: '2px',
                                left: isRoundFilterEnabled ? '20px' : '2px',
                                transition: 'left 0.3s ease',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
                            }}
                        />
                    </div>
                    <span className={`mode-label ${isRoundFilterEnabled ? 'active' : ''}`}>On</span>
                </div>
            </div>

            {/* Round Range Selector */}
            {isRoundFilterEnabled && (
                <RoundRangeSelector 
                    onRangeChange={handleRoundRangeChange} 
                    initialStart={roundRange.start ?? 1} 
                    initialEnd={roundRange.end ?? 38} 
                />
            )}

            {/* Divider */}
            {hasData && <div className="divider"></div>}

            {/* Team Overview Cards */}
            {hasData && (
                <div className="overview-section">
                    <h2 className="section-title">Team Overview</h2>
                    <div className="team-cards-grid">
                        {teamsStatsData.map((team, index) => (
                            <TeamStatCard 
                                key={team.team_id}
                                team={team}
                                color={TEAM_COLORS[index % TEAM_COLORS.length]}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Divider */}
            {hasData && <div className="divider"></div>}

            <div className="w-full">
                <StatSelect handleStatSelect={handleStatSelect} selectedStat={statType} />
            </div>

            {/* Statistical Charts */}
            {hasData ? (
                <div className="stats-section">
                    {/* Disclaimer for percentage stats */}
                    {hasPercentageStats && (
                        <div className="percentage-disclaimer">
                            <span>ℹ️</span> Stats marked with * are pre-calculated ratios/percentages
                        </div>
                    )}

                    {/* Charts Grid */}
                    <div className="charts-container">
                        {chartsToDisplay.map((chart) => {
                            const chartKey = `${currentCategory}-${chart.key}`;
                            const mode = chartModes[chartKey] || 'raw';
                            
                            let finalConfig = chart;
                            
                            if (mode === 'normalized') {
                                finalConfig = chart;
                            } else {
                                if (chart.source === 'percentages') {
                                    finalConfig = chart;
                                } else {
                                    const rawKey = normalizedToRawMapping[chart.key] || chart.key;
                                    const rawChart = validRawCharts.find(c => c.key === rawKey);
                                    finalConfig = rawChart || chart;
                                }
                            }
                            
                            const data = prepareChartData(currentCategory, mode, finalConfig);

                            return (
                                <StatChart
                                    key={chartKey}
                                    title={finalConfig.title}
                                    data={data}
                                    isPercentage={finalConfig.isPercentage}
                                    showDisclaimer={finalConfig.hasDisclaimer}
                                    currentMode={mode}
                                    onToggleMode={() => handleChartToggle(chartKey, mode)}
                                />
                            );
                        })}
                    </div>

                    {/* Load More Button */}
                    {hasMoreCharts && (
                        <div className="load-more-container">
                            <button className="load-more-button" onClick={handleLoadMore}>
                                Load More
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-state-icon">📊</div>
                    <div className="empty-state-text">No data to display</div>
                    <div className="empty-state-subtext">
                        Select a league, season(s), and team(s) to view statistics
                    </div>
                </div>
            )}
        </div>
    );
}

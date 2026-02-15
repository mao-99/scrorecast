import { useState, useEffect } from 'react';
import LeagueSelection from "../components/leagueSelection"
import SeasonSelection from '../components/seasonSelection';
import RoundRangeSelector from '../components/roundRangeSelector';
import LeagueTable from '../components/leagueTable';
import StatChart from '../components/statChart';
import "./leagues.css"

export default function Leagues() {
    const [selectedLeague, setSelectedLeague] = useState(null);
    const [selectedLeagueName, setSelectedLeagueName] = useState('');
    const [selectedSeasons, setSelectedSeasons] = useState([]);
    const [isRoundFilterEnabled, setIsRoundFilterEnabled] = useState(false);
    const [roundRange, setRoundRange] = useState({ start: null, end: null });
    const [statsData, setStatsData] = useState([]);
    const [visibleCount, setVisibleCount] = useState(10);

    const handleLeagueChange = (leagueId, leagueName) => {
        setSelectedLeague(leagueId);
        setSelectedLeagueName(leagueName || '');
    }

    const handleRoundRangeChange = (range) => {
        setRoundRange(range);
    }

    const handleRoundFilterToggle = () => {
        const newState = !isRoundFilterEnabled;
        setIsRoundFilterEnabled(newState);
        
        if (newState) {
            if (!roundRange.start || !roundRange.end) {
                setRoundRange({ start: 1, end: 38 });
            }
        } else {
            setRoundRange({ start: null, end: null });
        }
    };

    const handleSelectedSeasonChange = (seasons) => {
        setSelectedSeasons(seasons);
    }

    const handleLoadMore = () => {
        setVisibleCount(prevCount => prevCount + 10);
    };

    const handleLoadLess = () => {
        setVisibleCount(prevCount => Math.max(10, prevCount - 10));
    };

    // Reset visible count when league or seasons change
    useEffect(() => {
        setVisibleCount(10);
    }, [selectedLeague, selectedSeasons]);

    // Fetch stats data for charts (same as table)
    useEffect(() => {
        if (!selectedLeague || selectedSeasons.length === 0) {
            setStatsData([]);
            return;
        }

        const fetchStats = async () => {
            try {
                const requestBody = {
                    seasons: selectedSeasons,
                    ...(isRoundFilterEnabled && roundRange.start !== null && roundRange.end !== null ? {
                        roundStart: roundRange.start,
                        roundEnd: roundRange.end
                    } : {})
                };

                const response = await fetch(`/api/leagues/${selectedLeague}/standings`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody)
                });
                const data = await response.json();
                setStatsData(data);
            } catch (error) {
                console.error("Error fetching stats:", error);
                setStatsData([]);
            }
        };

        fetchStats();
    }, [selectedLeague, selectedSeasons, roundRange, isRoundFilterEnabled]);

    useEffect(() => {
        console.log("Selected league updated:", selectedLeague);
        console.log("Selected seasons updated:", selectedSeasons);
    }, [selectedLeague, selectedSeasons]);

    return (
        <div className="leagues-container">
            {/* League & Season Filters */}
            <div className="filters-row">
                <LeagueSelection onLeagueChange={handleLeagueChange} />
                <SeasonSelection onSeasonChange={handleSelectedSeasonChange} leagueId={selectedLeague} />
            </div>

            <div className="divider"></div>

            {/* Round Filter Toggle */}
            {selectedSeasons.length > 0 && (
                <>
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
                </>
            )}

            {/* League Overview Title with badge + Load Less */}
            <div className="overview-header mt-8">
                <h2 className="page-title my-0">League Overview</h2>
                {selectedLeagueName && (
                    <span className="active-league-badge">{selectedLeagueName}</span>
                )}
                <div className="overview-header-spacer" />
                {visibleCount > 10 && (
                    <button className="load-less-text" onClick={handleLoadLess}>
                        load less
                    </button>
                )}
            </div>

            {/* Standings Table */}
            <LeagueTable 
                leagueId={selectedLeague} 
                selectedSeasons={selectedSeasons}
                roundRange={roundRange}
                isRoundFilterEnabled={isRoundFilterEnabled}
                visibleCount={visibleCount}
                onLoadMore={handleLoadMore}
                onLoadLess={handleLoadLess}
            />

            {/* Statistical Charts */}
            {statsData.length > 0 && (
                <div className="charts-container">
                    <StatChart title="Wins" data={statsData} statKey="wins" />
                    <StatChart title="Draws" data={statsData} statKey="draws" />
                    <StatChart title="Losses" data={statsData} statKey="losses" />
                    <StatChart title="Goals For" data={statsData} statKey="goals_for" />
                    <StatChart title="Goals Against" data={statsData} statKey="goals_against" />
                    <StatChart title="Goal Difference" data={statsData} statKey="goal_difference" />
                    <StatChart title="Points" data={statsData} statKey="points" />
                </div>
            )}
        </div>
    );
}
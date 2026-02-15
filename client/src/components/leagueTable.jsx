import { useState, useEffect, useRef, useCallback } from 'react';

export default function LeagueTable({ leagueId, selectedSeasons, roundRange, isRoundFilterEnabled, visibleCount, onLoadMore, onLoadLess }) {
    const [standingsData, setStandingsData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showHint, setShowHint] = useState(true);
    const [slideDirection, setSlideDirection] = useState('');
    const tableRef = useRef(null);
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);
    const hasSwiped = useRef(false);

    const handleTeamClick = (teamName) => {
        console.log("Team clicked:", teamName);
        // TODO: Navigate to team detail page
    };

    // Swipe gesture handling
    const handleTouchStart = useCallback((e) => {
        touchStartX.current = e.touches[0].clientX;
        touchEndX.current = e.touches[0].clientX; // Reset so taps produce zero distance
        hasSwiped.current = false;
    }, []);

    const handleTouchMove = useCallback((e) => {
        touchEndX.current = e.touches[0].clientX;
        hasSwiped.current = true;
    }, []);

    const handleTouchEnd = useCallback(() => {
        // Only process if a real swipe occurred (not a tap)
        if (!hasSwiped.current) return;

        const swipeDistance = touchStartX.current - touchEndX.current;
        const minSwipeDistance = 50;

        if (swipeDistance > minSwipeDistance && !isExpanded) {
            setSlideDirection('slide-left');
            setIsExpanded(true);
            setShowHint(false);
        } else if (swipeDistance < -minSwipeDistance && isExpanded) {
            setSlideDirection('slide-right');
            setIsExpanded(false);
        }
    }, [isExpanded]);

    // Hide swipe hint after timeout
    useEffect(() => {
        const timer = setTimeout(() => setShowHint(false), 5000);
        return () => clearTimeout(timer);
    }, []);

    // Reset expanded state when data changes
    useEffect(() => {
        setIsExpanded(false);
        setSlideDirection('');
    }, [leagueId, selectedSeasons]);

    // Reset visible count when league or seasons change
    useEffect(() => {
        if (onLoadLess) {
            const currentVisible = visibleCount || 10;
            if (currentVisible !== 10) {
            }
        }
    }, [leagueId, selectedSeasons]);

    // Fetch standings when league or seasons change
    useEffect(() => {
        if (!leagueId || selectedSeasons.length === 0) {
            setStandingsData([]);
            return;
        }

        const fetchStandings = async () => {
            setLoading(true);
            try {
                const requestBody = {
                    seasons: selectedSeasons,
                    ...(isRoundFilterEnabled && roundRange?.start !== null && roundRange?.end !== null ? {
                        roundStart: roundRange.start,
                        roundEnd: roundRange.end
                    } : {})
                };

                const response = await fetch(`/api/leagues/${leagueId}/standings`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody)
                });
                const data = await response.json();
                console.log("Standings data:", data);
                setStandingsData(data);
            } catch (error) {
                console.error("Error fetching standings:", error);
                setStandingsData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchStandings();
    }, [leagueId, selectedSeasons, roundRange, isRoundFilterEnabled]);

    const toggleExpanded = () => {
        setSlideDirection(isExpanded ? 'slide-right' : 'slide-left');
        setIsExpanded(!isExpanded);
        setShowHint(false);
    };

    const visibleData = standingsData.slice(0, visibleCount);

    return (
        <div className="table-container">
            {loading ? (
                <p>Loading standings...</p>
            ) : standingsData.length === 0 ? (
                <p>Select a league and season to view standings</p>
            ) : (
                <>
                    {/* Desktop: full table — hidden on mobile */}
                    <div className="desktop-table">
                        <table className="standings-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th className="text-left">Team</th>
                                    <th>P</th>
                                    <th>W</th>
                                    <th>D</th>
                                    <th>L</th>
                                    <th>GF</th>
                                    <th>GA</th>
                                    <th>GD</th>
                                    <th>Pts</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visibleData.map((row, index) => (
                                    <tr
                                        key={row.id}
                                        className="table-row"
                                        onClick={() => handleTeamClick(row.name)}
                                    >
                                        <td>{index + 1}</td>
                                        <td className="team-name">{row.full_name}</td>
                                        <td>{row.played}</td>
                                        <td>{row.wins}</td>
                                        <td>{row.draws}</td>
                                        <td>{row.losses}</td>
                                        <td>{row.goals_for}</td>
                                        <td>{row.goals_against}</td>
                                        <td className="goal-diff">{row.goal_difference > 0 ? '+' : ''}{row.goal_difference}</td>
                                        <td className="points">{row.points}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile: compact expandable table — hidden on desktop */}
                    <div
                        className="mobile-table"
                        ref={tableRef}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        {/* Pill-style tab toggle */}
                        <div className="mobile-table-header">
                            <div className="table-view-toggle">
                                <button
                                    className={`tab-btn ${!isExpanded ? 'active' : ''}`}
                                    onClick={() => { if (isExpanded) toggleExpanded(); }}
                                >
                                    Standings
                                </button>
                                <button
                                    className={`tab-btn ${isExpanded ? 'active' : ''}`}
                                    onClick={() => { if (!isExpanded) toggleExpanded(); }}
                                >
                                    Goals
                                </button>
                            </div>
                        </div>

                        {/* Swipe hint */}
                        <div className="swipe-hint">
                            <span>Swipe or tap to switch views</span>
                        </div>

                        {/* Table — no horizontal scroll */}
                        <div
                            key={isExpanded ? 'expanded' : 'collapsed'}
                            className={`mobile-table-slide ${slideDirection}`}
                        >
                            <table className="standings-table mobile">
                                <thead>
                                    <tr>
                                        <th className="col-pos">#</th>
                                        <th className="col-team text-left">Team</th>
                                        {!isExpanded ? (
                                            <>
                                                <th>P</th>
                                                <th>W</th>
                                                <th>L</th>
                                                <th>D</th>
                                                <th>Pts</th>
                                            </>
                                        ) : (
                                            <>
                                                <th>GF</th>
                                                <th>GA</th>
                                                <th>GD</th>
                                                <th>Pts</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {visibleData.map((row, index) => (
                                        <tr
                                            key={row.id}
                                            className="table-row"
                                            onClick={() => handleTeamClick(row.name)}
                                        >
                                            <td className="col-pos">{index + 1}</td>
                                            <td className="col-team team-name">
                                                {row.abbreviation || row.full_name}
                                            </td>
                                            {!isExpanded ? (
                                                <>
                                                    <td>{row.played}</td>
                                                    <td>{row.wins}</td>
                                                    <td>{row.losses}</td>
                                                    <td>{row.draws}</td>
                                                    <td className="points">{row.points}</td>
                                                </>
                                            ) : (
                                                <>
                                                    <td>{row.goals_for}</td>
                                                    <td>{row.goals_against}</td>
                                                    <td className="goal-diff">
                                                        {row.goal_difference > 0 ? '+' : ''}{row.goal_difference}
                                                    </td>
                                                    <td className="points">{row.points}</td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {visibleCount < standingsData.length && onLoadMore && (
                        <button className="load-more-button" onClick={onLoadMore}>
                            Load More
                        </button>
                    )}
                </>
            )}
        </div>
    );
}

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
    const [roundRange, setRoundRange] = useState({ start: 1, end: 38 });
    const [statsData, setStatsData] = useState([]);
    const [visibleCount, setVisibleCount] = useState(10);

    const handleLeagueChange = (leagueId, leagueName) => {
        setSelectedLeague(leagueId);
        setSelectedLeagueName(leagueName || '');
    }

    const handleRoundRangeChange = (range) => {
        setRoundRange(range);
    }

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
                const response = await fetch(`/api/leagues/${selectedLeague}/standings`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        seasons: selectedSeasons
                    })
                });
                const data = await response.json();
                setStatsData(data);
            } catch (error) {
                console.error("Error fetching stats:", error);
                setStatsData([]);
            }
        };

        fetchStats();
    }, [selectedLeague, selectedSeasons]);

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

            {/* Round-Range Filter */}
            {selectedSeasons.length > 0 && (
                <RoundRangeSelector onRangeChange={handleRoundRangeChange} />
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
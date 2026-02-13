import { useState, useEffect } from "react";

export default function SeasonButtonGroup({ onSeasonChange, leagueId }) {
    const [seasons, setSeasons] = useState([]);
    const [selectedSeasons, setSelectedSeasons] = useState([]);

    const handleSelectSeason = (seasonId) => {
        const isSeasonSelected = selectedSeasons.includes(seasonId);
        
        // Calculate new state value
        const newSelectedSeasons = isSeasonSelected 
            ? selectedSeasons.filter((id) => id !== seasonId)  // Remove ID
            : [...selectedSeasons, seasonId];  // Add ID
        
        // Update state and notify parent with the SAME new value
        setSelectedSeasons(newSelectedSeasons);
        onSeasonChange(newSelectedSeasons);
    };

    useEffect(() => {
        if (!leagueId) return;
        
        // Fetch seasons for this league
        const fetchSeasons = async () => {
            try {
                const response = await fetch(`/api/leagues/${leagueId}/seasons`);
                const data = await response.json();
                setSeasons(data);
                setSelectedSeasons([]); // Reset selections when league changes
                onSeasonChange([]); // Notify parent of reset
            } catch (error) {
                console.error("Error fetching seasons:", error);
            }
        };
        
        fetchSeasons();
    }, [leagueId]);

    return (
        <>
            <h1 className="text-2xl font-bold mt-4 mb-6">Season(s)</h1>
            <div className="section flex justify-center">
                <div className="season-button-group flex justify-center">
                    {seasons.map((season) => (
                        <button
                            key={season.id}
                            className={`season-button ${selectedSeasons.includes(season.id) ? 'active' : ''}`}
                            onClick={() => handleSelectSeason(season.id)}
                        >
                            {season.name.replace('_', ' - ')}
                        </button>
                    ))}
                </div>
            </div>
        </>

    );
}

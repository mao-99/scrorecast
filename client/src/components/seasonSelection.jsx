import { useState, useEffect, useRef } from "react"

export default function SeasonSelection({ onSeasonChange, leagueId }) {
    const [seasons, setSeasons] = useState([])
    const [selectedSeasons, setSelectedSeasons] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleSelectSeason = (seasonId) => {
        const isSeasonSelected = selectedSeasons.includes(seasonId);
        const newSelectedSeasons = isSeasonSelected 
            ? selectedSeasons.filter((id) => id !== seasonId)
            : [...selectedSeasons, seasonId];
        
        setSelectedSeasons(newSelectedSeasons);
        onSeasonChange(newSelectedSeasons);
    }

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!leagueId) return;
        
        const fetchSeasons = async () => {
            const response = await fetch(`/api/leagues/${leagueId}/seasons`);
            const data = await response.json();
            setSeasons(data);
            setSelectedSeasons([]);
            onSeasonChange([]);
        };
        
        fetchSeasons();
    }, [leagueId])

    const getDisplayText = () => {
        if (selectedSeasons.length === 0) return 'Select Seasons';
        if (selectedSeasons.length === 1) {
            const season = seasons.find(s => s.id === selectedSeasons[0]);
            return season ? season.name.replace('_', ' – ') : '1 selected';
        }
        return `${selectedSeasons.length} seasons selected`;
    };

    return (
        <div className="selector-wrapper">
            {/* Desktop: Button group */}
            <div className="desktop-only">
                <h2 className="selector-heading">Season(s)</h2>
                <div className="button-group">
                    {seasons.map((season) => (
                        <button
                            key={season.id}
                            className={`selector-button ${selectedSeasons.includes(season.id) ? 'active' : ''}`}
                            onClick={() => handleSelectSeason(season.id)}
                        >
                            {season.name.replace('_', ' – ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Mobile: Dropdown */}
            <div className="mobile-only" ref={dropdownRef}>
                <label className="dropdown-label">Season(s)</label>
                <button
                    className={`dropdown-trigger ${isOpen ? 'open' : ''}`}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span className="dropdown-trigger-text">{getDisplayText()}</span>
                    <span className={`dropdown-chevron ${isOpen ? 'rotated' : ''}`}>▼</span>
                </button>
                {isOpen && (
                    <div className="dropdown-menu">
                        {seasons.map((season) => (
                            <div
                                key={season.id}
                                className={`dropdown-item ${selectedSeasons.includes(season.id) ? 'selected' : ''}`}
                                onClick={() => handleSelectSeason(season.id)}
                            >
                                <span className={`dropdown-checkbox ${selectedSeasons.includes(season.id) ? 'checked' : ''}`}>
                                    {selectedSeasons.includes(season.id) && '✓'}
                                </span>
                                <span>{season.name.replace('_', ' – ')}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
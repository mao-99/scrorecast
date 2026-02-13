import { useState, useEffect, useRef } from "react"
import useIsMobile from '../hooks/useIsMobile';

export default function FilteredSeasonSelector({ onSeasonChange, seasons }) {
    const [selectedSeasons, setSelectedSeasons] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const isMobile = useIsMobile();
    const dropdownRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectSeason = (seasonId) => {
        const isSeasonSelected = selectedSeasons.includes(seasonId);
        
        // Calculate new state value
        const newSelectedSeasons = isSeasonSelected 
            ? selectedSeasons.filter((id) => id !== seasonId)  // Remove ID
            : [...selectedSeasons, seasonId];  // Add ID
        
        // Update state and notify parent with the SAME new value
        setSelectedSeasons(newSelectedSeasons);
        onSeasonChange(newSelectedSeasons);
    }

    const formatSeason = (season) => season.replace('_', ' - ');

    return (
        <>
            <div className="section pt-8 pb-4">
                {isMobile ? (
                    /* ── Mobile: Multi-select dropdown ── */
                    <div className="season-dropdown-wrapper" ref={dropdownRef}>
                        {/* Selected seasons as pills */}
                        {selectedSeasons.length > 0 && (
                            <div className="season-selected-pills">
                                {selectedSeasons.map((season, index) => (
                                    <span key={index} className="season-pill">
                                        {formatSeason(season)}
                                        <button
                                            className="season-pill-remove"
                                            onClick={() => handleSelectSeason(season)}
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        <div
                            className="season-dropdown-trigger"
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            <span className="season-dropdown-text">
                                {selectedSeasons.length === 0
                                    ? 'Select seasons...'
                                    : `${selectedSeasons.length} season${selectedSeasons.length > 1 ? 's' : ''} selected`}
                            </span>
                            <span className={`season-dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
                        </div>

                        {isOpen && (
                            <div className="season-dropdown-menu">
                                {seasons.map((season, index) => {
                                    const selected = selectedSeasons.includes(season);
                                    return (
                                        <div
                                            key={index}
                                            className={`season-dropdown-option ${selected ? 'selected' : ''}`}
                                            onClick={() => handleSelectSeason(season)}
                                        >
                                            <div className={`season-dropdown-checkbox ${selected ? 'checked' : ''}`} />
                                            <span>{formatSeason(season)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ) : (
                    /* ── Desktop: Button pills ── */
                    <div className="season-group">
                        <div className="season-row justify-center">
                            {seasons.map((season, index) => (
                                <button
                                    key={index}
                                    className={`my-2 season-button ${selectedSeasons.includes(season) ? 'active' : ''}`}
                                    onClick={() => handleSelectSeason(season)}
                                >
                                    {formatSeason(season)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <div className="divider"></div>
        </>
    )
}
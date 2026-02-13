import { useEffect, useState, useRef } from "react"

export default function LeagueSelection({ onLeagueChange }) {
    const [leagues, setLeagues] = useState(null)
    const [selectedLeague, setSelectedLeague] = useState(null)
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef(null)

    const handleSelect = (league) => {
        setSelectedLeague(league);
        onLeagueChange(league.id, league.name);
        setIsOpen(false);
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
        const getLeagues = async () => {
            const response = await fetch('/api/leagues')
            const data = await response.json()
            setLeagues(data);
            if (data && data.length > 0) {
                setSelectedLeague(data[0]);
                onLeagueChange(data[0].id, data[0].name);
            }
        }
        getLeagues();
    }, [])

    const selectedName = selectedLeague?.name || 'Select League';

    return (
        <div className="selector-wrapper">
            {/* Desktop: Button group */}
            <div className="desktop-only">
                <h2 className="selector-heading">League</h2>
                <div className="button-group">
                    {leagues && leagues.map((league) => (
                        <button
                            key={league.id}
                            className={`selector-button ${selectedLeague?.id === league.id ? 'active' : ''}`}
                            onClick={() => handleSelect(league)}
                        >
                            {league.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Mobile: Dropdown */}
            <div className="mobile-only" ref={dropdownRef}>
                <label className="dropdown-label">League</label>
                <button
                    className={`dropdown-trigger ${isOpen ? 'open' : ''}`}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span className="dropdown-trigger-text">{selectedName}</span>
                    <span className={`dropdown-chevron ${isOpen ? 'rotated' : ''}`}>▼</span>
                </button>
                {isOpen && (
                    <div className="dropdown-menu">
                        {leagues && leagues.map((league) => (
                            <div
                                key={league.id}
                                className={`dropdown-item ${selectedLeague?.id === league.id ? 'selected' : ''}`}
                                onClick={() => handleSelect(league)}
                            >
                                <span className={`dropdown-radio ${selectedLeague?.id === league.id ? 'checked' : ''}`} />
                                <span>{league.name}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
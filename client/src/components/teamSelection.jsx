import { useState, useEffect, useRef } from "react";

export default function TeamSelect({ onTeamsChange, maxTeams = 25 }) {
    const [teams, setTeams] = useState([]);
    const [selectedTeams, setSelectedTeams] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef(null);

    // Fetch teams for the league
    useEffect(() => {

        const fetchTeams = async () => {
            try {
                const response = await fetch(`/api/teams/`);
                const data = await response.json();
                setTeams(data);
                setSelectedTeams([]); // Reset when league changes
                onTeamsChange([]);
            } catch (error) {
                console.error("Error fetching teams:", error);
            }
        };
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        fetchTeams();
        document.addEventListener("mousedown", handleClickOutside);

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleToggleTeam = (team) => {
        const isSelected = selectedTeams.some(t => t.id === team.id);
        
        let newSelectedTeams;
        if (isSelected) {
            // Remove team
            newSelectedTeams = selectedTeams.filter(t => t.id !== team.id);
        } else {
            // Add team (if not at max)
            if (selectedTeams.length >= maxTeams) {
                return; // Don't allow more than maxTeams
            }
            newSelectedTeams = [...selectedTeams, team];
        }
        
        setSelectedTeams(newSelectedTeams);
        onTeamsChange(newSelectedTeams);
    };

    const handleRemoveTeam = (teamId) => {
        const newSelectedTeams = selectedTeams.filter(t => t.id !== teamId);
        setSelectedTeams(newSelectedTeams);
        onTeamsChange(newSelectedTeams);
    };

    const filteredTeams = teams.filter(team =>
        team.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isTeamSelected = (teamId) => selectedTeams.some(t => t.id === teamId);
    const isMaxReached = selectedTeams.length >= maxTeams;

    return (
    <>
        <h1 className="text-2xl font-bold my-4">Teams</h1>
        
        <div className="team-multiselect flex justify-center flex-col pb-4">

            {/* Selected Teams Pills */}
            <div className="selected-teams-pills fle w-full mx-auto my-4">
                {selectedTeams.length === 0 ? (
                    <span className="pills-placeholder mx-auto my-0">No teams selected</span>
                ) : (
                    selectedTeams.map((team) => (
                        <div key={team.id} className="team-pill">
                            <span>{team.full_name || team.name}</span>
                            <button
                                className="pill-remove"
                                onClick={() => handleRemoveTeam(team.id)}
                                aria-label={`Remove ${team.full_name || team.name}`}
                            >
                                ×
                            </button>
                        </div>
                    ))
                )}
            </div>

            <div ref={dropdownRef} className="team-dropdown-wrapper">
                <div className="multiselect-input-container  mx-auto my-0">
                    <input
                        type="text"
                        className="multiselect-input"
                        placeholder="Search and select teams..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => setIsOpen(true)}
                    />
                    <span className={`multiselect-arrow ${isOpen ? 'open' : ''}`}>▼</span>
                </div>

                {isOpen && (
                    <div className="multiselect-dropdown  mx-auto my-0">
                        {filteredTeams.length === 0 ? (
                            <div className="multiselect-option" style={{ cursor: 'default', justifyContent: 'center' }}>
                                <span className="multiselect-option-text">No teams found</span>
                            </div>
                        ) : (
                            filteredTeams.map((team) => {
                                const selected = isTeamSelected(team.id);
                                const disabled = !selected && isMaxReached;
                                
                                return (
                                    <div
                                        key={team.id}
                                        className={`multiselect-option ${disabled ? 'disabled' : ''}`}
                                        onClick={() => !disabled && handleToggleTeam(team)}
                                    >
                                        <div className={`multiselect-checkbox ${selected ? 'checked' : ''}`}></div>
                                        <span className="multiselect-option-text">{team.full_name}</span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>

            {/* Max teams notice */}
            {isMaxReached && (
                <div className="max-teams-notice">
                    Maximum of {maxTeams} teams selected
                </div>
            )}
        </div>
    </>
    );
}

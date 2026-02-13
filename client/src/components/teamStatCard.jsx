import useIsMobile from '../hooks/useIsMobile';

export default function TeamStatCard({ team, color }) {
    const isMobile = useIsMobile();
    const displayName = isMobile
        ? (team.team_abbreviation || team.team_full_name)
        : team.team_full_name;

    return (
        <div className="team-stat-card" style={{ borderLeftColor: color }}>
            <div className="team-stat-card-header">
                <div className="team-name" style={{ color: color }}>
                    {displayName.toUpperCase()}
                </div>
                <div className="league-badge">
                    {team.league_name}
                </div>
            </div>
            
            <div className="team-stat-card-body">
                <div className="stat-row">
                    <span className="stat-label">Matches Played</span>
                    <span className="stat-value">{team.matches_played}</span>
                </div>
                
                <div className="stat-row highlight">
                    <span className="stat-label">Record</span>
                    <span className="stat-value">
                        <span className="win-color">{team.general.raw.wins}W</span>
                        {' - '}
                        <span className="draw-color">{team.general.raw.draws}D</span>
                        {' - '}
                        <span className="loss-color">{team.general.raw.losses}L</span>
                    </span>
                </div>
                
                <div className="stat-row">
                    <span className="stat-label">Points</span>
                    <span className="stat-value points-value">{team.general.raw.points}</span>
                </div>
                
                <div className="stat-row">
                    <span className="stat-label">Goals</span>
                    <span className="stat-value">
                        {team.general.raw.goals_for} - {team.general.raw.goals_against}
                        <span className="goal-diff" style={{ 
                            color: team.general.raw.goal_difference > 0 ? '#10b981' : 
                                   team.general.raw.goal_difference < 0 ? '#ef4444' : '#6b7280'
                        }}>
                            {' '}({team.general.raw.goal_difference > 0 ? '+' : ''}{team.general.raw.goal_difference})
                        </span>
                    </span>
                </div>
                
                <div className="stat-row">
                    <span className="stat-label">Clean Sheets</span>
                    <span className="stat-value">{team.general.raw.clean_sheets}</span>
                </div>
            </div>
        </div>
    );
}

import { pool } from "../db/database.js";

/**
 * Get all seasons, optionally filtered by league
 */
const getSeasons = async (req, res) => {
    const { leagueId } = req.query;
    
    let query = `
        SELECT 
            s.id,
            s.name,
            s.year,
            s.status,
            s.league_id,
            l.name AS league_name,
            l.country
        FROM seasons s
        JOIN leagues l ON s.league_id = l.id
    `;
    
    const params = [];
    
    if (leagueId) {
        query += ` WHERE s.league_id = $1`;
        params.push(leagueId);
    }
    
    query += ` ORDER BY s.year DESC, l.name`;
    
    try {
        const results = await pool.query(query, params);
        res.status(200).json(results.rows);
    } catch (error) {
        console.error("Error getting seasons from db: ", error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get team progression statistics across multiple seasons
 * This is the core endpoint for the Seasons tab - tracks team evolution over time
 */
const getSeasonTeams = async (req, res) => {
    try {
        const { ids } = req.body;

        // Input validation
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: "Valid team IDs array required" });
        }

        const query = `
            SELECT 
                t.name AS team_name,
                t.full_name AS team_full_name,
                t.abbreviation AS team_abbreviation,
                ts.id,
                ts.team_id,
                s.name AS season,
                l.name AS league_name,
                ts.matches_played,
                ts.points,
                ts.wins,
                ts.draws,
                ts.losses,
                ts.goals_for,
                ts.goals_against,
                ts.goal_difference,
                ts.clean_sheets,
                ts.failed_to_score,
                ts.home_matches,
                ts.away_matches,
                ts.home_wins,
                ts.home_draws,
                ts.home_losses,
                ts.away_wins,
                ts.away_draws,
                ts.away_losses,
                ts.home_goals_for,
                ts.home_goals_against,
                ts.away_goals_for,
                ts.away_goals_against,
                ts.points_per_game::float,
                ts.win_percentage::float,
                ts.home_win_percentage::float,
                ts.away_win_percentage::float,
                ROUND(ts.goals_for::decimal / NULLIF(ts.matches_played, 0), 2)::float AS goals_per_game,
                ROUND(ts.goals_against::decimal / NULLIF(ts.matches_played, 0), 2)::float AS goals_conceded_per_game,
                ROUND((ts.clean_sheets::decimal / NULLIF(ts.matches_played, 0)) * 100, 2)::float AS clean_sheet_percentage
            FROM team_seasons ts
            JOIN seasons s ON ts.season_id = s.id
            JOIN leagues l ON s.league_id = l.id
            JOIN teams t ON ts.team_id = t.id
            WHERE ts.team_id = ANY($1::int[])
            ORDER BY team_name, season
        `;

        const response = await pool.query(query, [ids]);
        res.status(200).json(response.rows);
    } catch (error) {
        console.error("Error getting team seasons progression:", error);
        res.status(500).json({ error: error.message });
    }
};

export default {
    getSeasons,
    getSeasonTeams
};
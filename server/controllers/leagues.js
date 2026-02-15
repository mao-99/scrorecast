import { pool } from "../db/database.js";


const getLeagues = async (req, res) => {
    const query = `SELECT * FROM leagues;`

    try {
        const results = await pool.query(query)
        res.status(200).send(results.rows)
    } catch (error) {
        console.error("Error getting leagues from db: ", error);
        res.status(500).json({ error: 'Failed to fetch leagues' })
    }
}

const getLeagueSeasons = async (req, res) => {
    const leagueId = req.params.leagueId

    if (!leagueId || isNaN(Number(leagueId))) {
        return res.status(400).json({ error: 'Invalid league ID' })
    }

    const query = `SELECT * from seasons WHERE league_id = $1 ORDER BY name;`
    try {
        const results = await pool.query(query, [leagueId])
        res.status(200).send(results.rows)
    } catch (error) {
        console.error("Error getting league seasons from db: ", error);
        res.status(500).json({ error: 'Failed to fetch league seasons' })
    }
}

const getLeagueStandings = async (req, res) => {
    const leagueId = req.params.leagueId;
    const seasonIds = req.body.seasons;
    const roundStart = req.body.roundStart;
    const roundEnd = req.body.roundEnd;

    if (!leagueId || isNaN(Number(leagueId))) {
        return res.status(400).json({ error: 'Invalid league ID' })
    }
    
    // Validate seasons array
    const seasonArray = Array.isArray(seasonIds) ? seasonIds.filter(id => !isNaN(Number(id))) : [];
    
    if (seasonArray.length === 0) {
        return res.status(400).json({ error: "At least one season must be selected" });
    }

    // Build round filter clause and params
    const hasRoundFilter = roundStart != null && roundEnd != null && !isNaN(Number(roundStart)) && !isNaN(Number(roundEnd));
    const roundClause = hasRoundFilter ? `AND round >= $3 AND round <= $4` : '';
    const queryParams = hasRoundFilter
        ? [leagueId, seasonArray, Number(roundStart), Number(roundEnd)]
        : [leagueId, seasonArray];
    
    const query = `
        WITH home_stats AS (
            SELECT 
                home_team_id AS team_id,
                COUNT(*) AS played,
                SUM(CASE WHEN home_goals > away_goals THEN 1 ELSE 0 END) AS wins,
                SUM(CASE WHEN home_goals = away_goals THEN 1 ELSE 0 END) AS draws,
                SUM(CASE WHEN home_goals < away_goals THEN 1 ELSE 0 END) AS losses,
                SUM(home_goals) AS goals_for,
                SUM(away_goals) AS goals_against,
                SUM(CASE 
                    WHEN home_goals > away_goals THEN 3
                    WHEN home_goals = away_goals THEN 1
                    ELSE 0
                END) AS points
            FROM matches
            WHERE league_id = $1 
              AND season_id = ANY($2::int[])
              AND home_goals IS NOT NULL
              AND away_goals IS NOT NULL
              ${roundClause}
            GROUP BY home_team_id
        ),
        away_stats AS (
            SELECT 
                away_team_id AS team_id,
                COUNT(*) AS played,
                SUM(CASE WHEN away_goals > home_goals THEN 1 ELSE 0 END) AS wins,
                SUM(CASE WHEN away_goals = home_goals THEN 1 ELSE 0 END) AS draws,
                SUM(CASE WHEN away_goals < home_goals THEN 1 ELSE 0 END) AS losses,
                SUM(away_goals) AS goals_for,
                SUM(home_goals) AS goals_against,
                SUM(CASE 
                    WHEN away_goals > home_goals THEN 3
                    WHEN away_goals = home_goals THEN 1
                    ELSE 0
                END) AS points
            FROM matches
            WHERE league_id = $1 
              AND season_id = ANY($2::int[])
              AND home_goals IS NOT NULL
              AND away_goals IS NOT NULL
              ${roundClause}
            GROUP BY away_team_id
        )
        SELECT 
            t.id,
            t.full_name,
            t.full_name as team_name,
            t.name,
            t.short_name,
            t.abbreviation,
            COALESCE(h.played, 0) + COALESCE(a.played, 0) AS played,
            COALESCE(h.wins, 0) + COALESCE(a.wins, 0) AS wins,
            COALESCE(h.draws, 0) + COALESCE(a.draws, 0) AS draws,
            COALESCE(h.losses, 0) + COALESCE(a.losses, 0) AS losses,
            COALESCE(h.goals_for, 0) + COALESCE(a.goals_for, 0) AS goals_for,
            COALESCE(h.goals_against, 0) + COALESCE(a.goals_against, 0) AS goals_against,
            COALESCE(h.goals_for, 0) + COALESCE(a.goals_for, 0) - 
            COALESCE(h.goals_against, 0) - COALESCE(a.goals_against, 0) AS goal_difference,
            COALESCE(h.points, 0) + COALESCE(a.points, 0) AS points
        FROM teams t
        LEFT JOIN home_stats h ON t.id = h.team_id
        LEFT JOIN away_stats a ON t.id = a.team_id
        WHERE (h.team_id IS NOT NULL OR a.team_id IS NOT NULL)
        ORDER BY points DESC, goal_difference DESC, goals_for DESC;
    `;

    try {
        const results = await pool.query(query, queryParams);
        res.status(200).json(results.rows);
    } catch (error) {
        console.error("Error getting league standings: ", error);
        res.status(500).json({ error: "Failed to fetch standings" });
    }
};

export default {getLeagues, getLeagueSeasons, getLeagueStandings}
import { pool } from "../db/database.js";

const getTeams = async (req, res) => {
    const query = "SELECT * FROM teams;";

    try {
        const response = await pool.query(query);
        const results = response.rows;
        res.status(200).send(results);
    } catch (error) {
        console.error("Error getting teams from db: ", error);
        res.status(500).json({ error: 'Failed to fetch teams' })
    }
}

const getTeamSeasons = async (req, res) => {
    
    // TODO: parse request body for team ids
    const ids = req.body.teamIds;

    if (!Array.isArray(ids)) {
        return res.status(400).json({ error: 'teamIds must be an array' })
    }

    // Validate all IDs are numbers
    if (!ids.every(id => !isNaN(Number(id)))) {
        return res.status(400).json({ error: 'All team IDs must be numbers' })
    }

    const query = `SELECT 
                        season_id, 
                        seasons.name, 
                        seasons.status AS season_status,
                        leagues.name AS league_name, 
                        leagues.country, 
                        teams.id AS team_id,
                        teams.full_name,
                        teams.short_name
                    FROM team_seasons	
                    JOIN seasons ON team_seasons.season_id = seasons.id
                    JOIN leagues ON seasons.league_id = leagues.id
                    JOIN teams ON team_seasons.team_id = teams.id
                    WHERE team_id = ANY($1::int[])
                    GROUP BY seasons.status, seasons.name, season_id, leagues.id, leagues.name, leagues.country, teams.id, teams.full_name, teams.short_name
                    ORDER BY team_id ASC;
                    `;


    if (ids.length > 0) {
        try {
            const results = await pool.query(query, [ids]);
            // The goal of this is to get all season names where all selected teams participate.
            const combinedSeasons = {};
            results.rows.forEach((season) => {
                if (season.name in combinedSeasons) {
                    combinedSeasons[season.name].add(season.team_id)
                } else {
                    combinedSeasons[season.name] = new Set([season.team_id])
                }
            })
            const seasonNames = Object.keys(combinedSeasons).filter(
                season => combinedSeasons[season].size === ids.length
            );
            res.status(200).json([...seasonNames]);
        } catch (error) {
            console.error('Error getting team seasons:', error);
            res.status(500).json({ error: 'Failed to fetch team seasons' });
        }   
    }
    else {
        res.status(200).json([]);
    }


}


const getTeamStatistics = async (req, res) => {
    try {
        const { teamIds, seasons, roundStart, roundEnd } = req.body;
        let roundFiltered = false;

        if (!teamIds || teamIds.length === 0 || !seasons || seasons.length === 0) {
            return res.status(200).json([]);
        }

        // Validate teamIds are numbers
        if (!Array.isArray(teamIds) || !teamIds.every(id => !isNaN(Number(id)))) {
            return res.status(400).json({ error: 'teamIds must be an array of numbers' })
        }

        // Validate seasons are strings
        if (!Array.isArray(seasons) || !seasons.every(s => typeof s === 'string')) {
            return res.status(400).json({ error: 'seasons must be an array of strings' })
        }

        // Validate round range if provided
        if (roundStart !== undefined && isNaN(Number(roundStart))) {
            return res.status(400).json({ error: 'roundStart must be a number' })
        }
        if (roundEnd !== undefined && isNaN(Number(roundEnd))) {
            return res.status(400).json({ error: 'roundEnd must be a number' })
        }


        if (roundEnd || roundStart){
            roundFiltered = true;
        }

        const query = `
            WITH team_matches AS (
            SELECT 
                ms.team_id,
                t.short_name as team_name,
                t.full_name as team_full_name,
                t.abbreviation as team_abbreviation,
                l.name as league_name,
                COUNT(*) as matches_played,
                
                -- ============================================
                -- GENERAL TAB
                -- ============================================
                -- Raw stats
                SUM(CASE WHEN ms.result = 'win' THEN 1 ELSE 0 END) as wins,
                SUM(CASE WHEN ms.result = 'draw' THEN 1 ELSE 0 END) as draws,
                SUM(CASE WHEN ms.result = 'loss' THEN 1 ELSE 0 END) as losses,
                SUM(ms.points) as points,
                SUM(ms.goals_scored) as goals_for,
                SUM(ms.goals_conceded) as goals_against,
                SUM(ms.goals_scored - ms.goals_conceded) as goal_difference,
                SUM(CASE WHEN ms.goals_conceded = 0 THEN 1 ELSE 0 END) as clean_sheets,
                SUM(CASE WHEN ms.goals_scored = 0 THEN 1 ELSE 0 END) as failed_to_score,
                
                -- Normalized stats
                ROUND(AVG(ms.points), 2) as points_per_game,
                ROUND(AVG(ms.goals_scored), 2) as goals_per_game,
                ROUND(AVG(ms.goals_conceded), 2) as conceded_per_game,
                ROUND(SUM(CASE WHEN ms.result = 'win' THEN 1 ELSE 0 END)::numeric / COUNT(*), 3) as win_rate,
                ROUND(SUM(CASE WHEN ms.result = 'draw' THEN 1 ELSE 0 END)::numeric / COUNT(*), 3) as draw_rate,
                ROUND(SUM(CASE WHEN ms.result = 'loss' THEN 1 ELSE 0 END)::numeric / COUNT(*), 3) as loss_rate,
                ROUND(AVG(ms.possession), 3) as avg_possession,
                
                -- ============================================
                -- ATTACKING TAB
                -- ============================================
                -- Raw stats
                SUM(ms.shots) as shots,
                SUM(ms.shots_on_goal) as shots_on_goal,
                SUM(ms.shots_off_goal) as shots_off_goal,
                SUM(ms.xg) as xg,
                SUM(ms.corner_kicks) as corner_kicks,
                SUM(ms.offsides) as offsides,
                SUM(ms.blocked_shots) as blocked_shots,
                SUM(ms.big_chances) as big_chances,
                SUM(ms.shots_inside_box) as shots_inside_box,
                SUM(ms.shots_outside_box) as shots_outside_box,
                SUM(ms.hit_woodwork) as hit_woodwork,
                SUM(ms.free_kicks) as free_kicks,
                SUM(ms.throw_ins) as throw_ins,
                SUM(ms.touches_in_opposition_box) as touches_in_opposition_box,
                
                -- Already percentages/ratios (average them)
                ROUND(AVG(ms.shot_accuracy), 3) as shot_accuracy,
                ROUND(AVG(ms.goal_efficiency), 3) as goal_efficiency,
                ROUND(AVG(ms.conversion_rate), 3) as conversion_rate,
                ROUND(AVG(ms.xg_difference), 3) as xg_difference,
                ROUND(AVG(ms.xg_efficiency), 3) as xg_efficiency,
                
                -- Normalized stats
                ROUND(AVG(ms.shots), 2) as shots_per_game,
                ROUND(AVG(ms.shots_on_goal), 2) as shots_on_goal_per_game,
                ROUND(AVG(ms.xg), 3) as xg_per_game,
                ROUND(AVG(ms.big_chances), 2) as big_chances_per_game,
                ROUND(AVG(ms.corner_kicks), 2) as corners_per_game,
                ROUND(AVG(ms.offsides), 2) as offsides_per_game,
                ROUND(AVG(ms.touches_in_opposition_box), 2) as touches_in_box_per_game,
                
                -- ============================================
                -- DEFENSIVE TAB
                -- ============================================
                -- Raw stats
                SUM(ms.fouls) as fouls,
                SUM(ms.goalkeeper_saves) as goalkeeper_saves,
                SUM(ms.yellow_cards) as yellow_cards,
                SUM(ms.red_cards) as red_cards,
                SUM(ms.clearances) as clearances,
                SUM(ms.interceptions) as interceptions,
                SUM(ms.tackles_attempted) as tackles_attempted,
                SUM(ms.tackles_won) as tackles_won,
                
                -- Already percentage
                ROUND(AVG(ms.tackle_success_rate), 3) as tackle_success_rate,
                
                -- Normalized stats
                ROUND(AVG(ms.fouls), 2) as fouls_per_game,
                ROUND(AVG(ms.goalkeeper_saves), 2) as saves_per_game,
                ROUND(AVG(ms.yellow_cards), 2) as yellows_per_game,
                ROUND(AVG(ms.clearances), 2) as clearances_per_game,
                ROUND(AVG(ms.interceptions), 2) as interceptions_per_game,
                ROUND(AVG(ms.tackles_attempted), 2) as tackles_per_game,
                
                -- ============================================
                -- PASSING TAB
                -- ============================================
                -- Raw stats
                SUM(ms.passes_attempted) as passes_attempted,
                SUM(ms.passes_completed) as passes_completed,
                SUM(ms.final_third_passes_attempted) as final_third_passes_attempted,
                SUM(ms.final_third_passes_completed) as final_third_passes_completed,
                SUM(ms.crosses_attempted) as crosses_attempted,
                SUM(ms.crosses_completed) as crosses_completed,
                
                -- Already percentages
                ROUND(AVG(ms.pass_accuracy), 3) as pass_accuracy,
                ROUND(AVG(ms.final_third_pass_accuracy), 3) as final_third_pass_accuracy,
                ROUND(AVG(ms.cross_accuracy), 3) as cross_accuracy,
                
                -- Normalized stats
                ROUND(AVG(ms.passes_attempted), 2) as passes_per_game,
                ROUND(AVG(ms.passes_completed), 2) as passes_completed_per_game,
                ROUND(AVG(ms.final_third_passes_attempted), 2) as final_third_passes_per_game,
                ROUND(AVG(ms.crosses_attempted), 2) as crosses_per_game
                
            FROM match_statistics ms
            JOIN matches m ON ms.match_id = m.id
            JOIN teams t ON ms.team_id = t.id
            JOIN leagues l ON m.league_id = l.id
            JOIN seasons s ON m.season_id = s.id
            WHERE 
                ms.team_id = ANY($1)              -- teamIds array
                AND s.name = ANY($2)              -- seasonNames array
                AND ($3::int IS NULL OR m.round >= $3)  -- roundStart (optional)
                AND ($4::int IS NULL OR m.round <= $4)  -- roundEnd (optional)
            GROUP BY ms.team_id, t.short_name, t.full_name, t.abbreviation, l.name
            )
            SELECT * FROM team_matches
            ORDER BY points DESC, goal_difference DESC;
        `;

        const results = await pool.query(query, [teamIds, seasons, roundStart || null, roundEnd || null]);
        
        // Get unique leagues from the selected teams
        const leagues = [...new Set(results.rows.map(row => row.league_name))];
        
        // Query for league averages - two-level aggregation
        const leagueAvgQuery = `
            WITH team_stats_per_league AS (
                -- First level: Calculate per-team statistics
                SELECT 
                    l.name as league_name,
                    ms.team_id,
                    -- Per game stats
                    ROUND(AVG(ms.points), 2) as points_per_game,
                    ROUND(AVG(ms.goals_scored), 2) as goals_per_game,
                    ROUND(AVG(ms.goals_conceded), 2) as conceded_per_game,
                    ROUND(SUM(CASE WHEN ms.result = 'win' THEN 1 ELSE 0 END)::numeric / COUNT(*), 3) as win_rate,
                    ROUND(SUM(CASE WHEN ms.result = 'draw' THEN 1 ELSE 0 END)::numeric / COUNT(*), 3) as draw_rate,
                    ROUND(SUM(CASE WHEN ms.result = 'loss' THEN 1 ELSE 0 END)::numeric / COUNT(*), 3) as loss_rate,
                    ROUND(AVG(ms.possession), 3) as avg_possession,
                    
                    -- Raw totals
                    SUM(CASE WHEN ms.result = 'win' THEN 1 ELSE 0 END) as wins,
                    SUM(CASE WHEN ms.result = 'draw' THEN 1 ELSE 0 END) as draws,
                    SUM(CASE WHEN ms.result = 'loss' THEN 1 ELSE 0 END) as losses,
                    SUM(ms.points) as points,
                    SUM(ms.goals_scored) as goals_for,
                    SUM(ms.goals_conceded) as goals_against,
                    SUM(ms.goals_scored - ms.goals_conceded) as goal_difference,
                    
                    -- Attacking
                    ROUND(AVG(ms.shots), 2) as shots_per_game,
                    ROUND(AVG(ms.shots_on_goal), 2) as shots_on_goal_per_game,
                    ROUND(AVG(ms.xg), 3) as xg_per_game,
                    ROUND(AVG(ms.big_chances), 2) as big_chances_per_game,
                    ROUND(AVG(ms.corner_kicks), 2) as corners_per_game,
                    ROUND(AVG(ms.offsides), 2) as offsides_per_game,
                    ROUND(AVG(ms.touches_in_opposition_box), 2) as touches_in_box_per_game,
                    SUM(ms.shots) as shots,
                    SUM(ms.shots_on_goal) as shots_on_goal,
                    SUM(ms.xg) as xg,
                    SUM(ms.corner_kicks) as corner_kicks,
                    ROUND(AVG(ms.shot_accuracy), 3) as shot_accuracy,
                    ROUND(AVG(ms.goal_efficiency), 3) as goal_efficiency,
                    ROUND(AVG(ms.conversion_rate), 3) as conversion_rate,
                    
                    -- Defensive
                    ROUND(AVG(ms.fouls), 2) as fouls_per_game,
                    ROUND(AVG(ms.goalkeeper_saves), 2) as saves_per_game,
                    ROUND(AVG(ms.yellow_cards), 2) as yellows_per_game,
                    ROUND(AVG(ms.clearances), 2) as clearances_per_game,
                    ROUND(AVG(ms.interceptions), 2) as interceptions_per_game,
                    ROUND(AVG(ms.tackles_attempted), 2) as tackles_per_game,
                    SUM(ms.fouls) as fouls,
                    SUM(ms.goalkeeper_saves) as goalkeeper_saves,
                    ROUND(AVG(ms.tackle_success_rate), 3) as tackle_success_rate,
                    
                    -- Passing
                    ROUND(AVG(ms.passes_attempted), 2) as passes_per_game,
                    ROUND(AVG(ms.passes_completed), 2) as passes_completed_per_game,
                    ROUND(AVG(ms.final_third_passes_attempted), 2) as final_third_passes_per_game,
                    ROUND(AVG(ms.crosses_attempted), 2) as crosses_per_game,
                    SUM(ms.passes_attempted) as passes_attempted,
                    SUM(ms.passes_completed) as passes_completed,
                    ROUND(AVG(ms.pass_accuracy), 3) as pass_accuracy,
                    ROUND(AVG(ms.final_third_pass_accuracy), 3) as final_third_pass_accuracy,
                    ROUND(AVG(ms.cross_accuracy), 3) as cross_accuracy
                FROM match_statistics ms
                JOIN matches m ON ms.match_id = m.id
                JOIN leagues l ON m.league_id = l.id
                JOIN seasons s ON m.season_id = s.id
                WHERE 
                    l.name = ANY($1)
                    AND s.name = ANY($2)
                    AND ($3::int IS NULL OR m.round >= $3)
                    AND ($4::int IS NULL OR m.round <= $4)
                GROUP BY l.name, ms.team_id
            )
            -- Second level: Average across all teams in each league
            SELECT 
                league_name,
                ROUND(AVG(points_per_game), 2) as points_per_game,
                ROUND(AVG(goals_per_game), 2) as goals_per_game,
                ROUND(AVG(conceded_per_game), 2) as conceded_per_game,
                ROUND(AVG(win_rate), 3) as win_rate,
                ROUND(AVG(draw_rate), 3) as draw_rate,
                ROUND(AVG(loss_rate), 3) as loss_rate,
                ROUND(AVG(avg_possession), 3) as avg_possession,
                ROUND(AVG(wins)) as wins,
                ROUND(AVG(draws)) as draws,
                ROUND(AVG(losses)) as losses,
                ROUND(AVG(points)) as points,
                ROUND(AVG(goals_for)) as goals_for,
                ROUND(AVG(goals_against)) as goals_against,
                ROUND(AVG(goal_difference)) as goal_difference,
                ROUND(AVG(shots_per_game), 2) as shots_per_game,
                ROUND(AVG(shots_on_goal_per_game), 2) as shots_on_goal_per_game,
                ROUND(AVG(xg_per_game), 3) as xg_per_game,
                ROUND(AVG(big_chances_per_game), 2) as big_chances_per_game,
                ROUND(AVG(corners_per_game), 2) as corners_per_game,
                ROUND(AVG(offsides_per_game), 2) as offsides_per_game,
                ROUND(AVG(touches_in_box_per_game), 2) as touches_in_box_per_game,
                ROUND(AVG(shots)) as shots,
                ROUND(AVG(shots_on_goal)) as shots_on_goal,
                ROUND(AVG(xg)) as xg,
                ROUND(AVG(corner_kicks)) as corner_kicks,
                ROUND(AVG(shot_accuracy), 3) as shot_accuracy,
                ROUND(AVG(goal_efficiency), 3) as goal_efficiency,
                ROUND(AVG(conversion_rate), 3) as conversion_rate,
                ROUND(AVG(fouls_per_game), 2) as fouls_per_game,
                ROUND(AVG(saves_per_game), 2) as saves_per_game,
                ROUND(AVG(yellows_per_game), 2) as yellows_per_game,
                ROUND(AVG(clearances_per_game), 2) as clearances_per_game,
                ROUND(AVG(interceptions_per_game), 2) as interceptions_per_game,
                ROUND(AVG(tackles_per_game), 2) as tackles_per_game,
                ROUND(AVG(fouls)) as fouls,
                ROUND(AVG(goalkeeper_saves)) as goalkeeper_saves,
                ROUND(AVG(tackle_success_rate), 3) as tackle_success_rate,
                ROUND(AVG(passes_per_game), 2) as passes_per_game,
                ROUND(AVG(passes_completed_per_game), 2) as passes_completed_per_game,
                ROUND(AVG(final_third_passes_per_game), 2) as final_third_passes_per_game,
                ROUND(AVG(crosses_per_game), 2) as crosses_per_game,
                ROUND(AVG(passes_attempted)) as passes_attempted,
                ROUND(AVG(passes_completed)) as passes_completed,
                ROUND(AVG(pass_accuracy), 3) as pass_accuracy,
                ROUND(AVG(final_third_pass_accuracy), 3) as final_third_pass_accuracy,
                ROUND(AVG(cross_accuracy), 3) as cross_accuracy
            FROM team_stats_per_league
            GROUP BY league_name;
        `;
        
        const leagueAvgResults = await pool.query(leagueAvgQuery, [leagues, seasons, roundStart || null, roundEnd || null]);
        
        // Transform flat results into categorized structure
        const transformedData = results.rows.map(row => ({
            team_id: row.team_id,
            team_name: row.team_name,
            team_full_name: row.team_full_name,
            team_abbreviation: row.team_abbreviation,
            league_name: row.league_name,
            matches_played: parseInt(row.matches_played),
            
            general: {
                raw: {
                    wins: row.wins,
                    draws: row.draws,
                    losses: row.losses,
                    points: row.points,
                    goals_for: row.goals_for,
                    goals_against: row.goals_against,
                    goal_difference: row.goal_difference,
                    clean_sheets: row.clean_sheets,
                    failed_to_score: row.failed_to_score
                },
                normalized: {
                    points_per_game: row.points_per_game,
                    goals_per_game: row.goals_per_game,
                    conceded_per_game: row.conceded_per_game,
                    win_rate: row.win_rate,
                    draw_rate: row.draw_rate,
                    loss_rate: row.loss_rate,
                    avg_possession: row.avg_possession
                }
            },
            
            attacking: {
                raw: {
                    shots: row.shots,
                    shots_on_goal: row.shots_on_goal,
                    shots_off_goal: row.shots_off_goal,
                    xg: row.xg,
                    corner_kicks: row.corner_kicks,
                    offsides: row.offsides,
                    blocked_shots: row.blocked_shots,
                    big_chances: row.big_chances,
                    shots_inside_box: row.shots_inside_box,
                    shots_outside_box: row.shots_outside_box,
                    hit_woodwork: row.hit_woodwork,
                    free_kicks: row.free_kicks,
                    throw_ins: row.throw_ins,
                    touches_in_opposition_box: row.touches_in_opposition_box
                },
                normalized: {
                    shots_per_game: row.shots_per_game,
                    shots_on_goal_per_game: row.shots_on_goal_per_game,
                    xg_per_game: row.xg_per_game,
                    big_chances_per_game: row.big_chances_per_game,
                    corners_per_game: row.corners_per_game,
                    offsides_per_game: row.offsides_per_game,
                    touches_in_box_per_game: row.touches_in_box_per_game
                },
                percentages: {
                    shot_accuracy: row.shot_accuracy,
                    goal_efficiency: row.goal_efficiency,
                    conversion_rate: row.conversion_rate,
                    xg_difference: row.xg_difference,
                    xg_efficiency: row.xg_efficiency
                }
            },
            
            defensive: {
                raw: {
                    fouls: row.fouls,
                    goalkeeper_saves: row.goalkeeper_saves,
                    yellow_cards: row.yellow_cards,
                    red_cards: row.red_cards,
                    clearances: row.clearances,
                    interceptions: row.interceptions,
                    tackles_attempted: row.tackles_attempted,
                    tackles_won: row.tackles_won
                },
                normalized: {
                    fouls_per_game: row.fouls_per_game,
                    saves_per_game: row.saves_per_game,
                    yellows_per_game: row.yellows_per_game,
                    clearances_per_game: row.clearances_per_game,
                    interceptions_per_game: row.interceptions_per_game,
                    tackles_per_game: row.tackles_per_game
                },
                percentages: {
                    tackle_success_rate: row.tackle_success_rate
                }
            },
            
            passing: {
                raw: {
                    passes_attempted: row.passes_attempted,
                    passes_completed: row.passes_completed,
                    final_third_passes_attempted: row.final_third_passes_attempted,
                    final_third_passes_completed: row.final_third_passes_completed,
                    crosses_attempted: row.crosses_attempted,
                    crosses_completed: row.crosses_completed
                },
                normalized: {
                    passes_per_game: row.passes_per_game,
                    passes_completed_per_game: row.passes_completed_per_game,
                    final_third_passes_per_game: row.final_third_passes_per_game,
                    crosses_per_game: row.crosses_per_game
                },
                percentages: {
                    pass_accuracy: row.pass_accuracy,
                    final_third_pass_accuracy: row.final_third_pass_accuracy,
                    cross_accuracy: row.cross_accuracy
                }
            }
        }));
        
        // Transform league averages
        const leagueAverages = leagueAvgResults.rows.map(row => ({
            league_name: row.league_name,
            isLeagueAverage: true,
            general: {
                raw: {
                    wins: row.wins,
                    draws: row.draws,
                    losses: row.losses,
                    points: row.points,
                    goals_for: row.goals_for,
                    goals_against: row.goals_against,
                    goal_difference: row.goal_difference
                },
                normalized: {
                    points_per_game: row.points_per_game,
                    goals_per_game: row.goals_per_game,
                    conceded_per_game: row.conceded_per_game,
                    win_rate: row.win_rate,
                    draw_rate: row.draw_rate,
                    loss_rate: row.loss_rate,
                    avg_possession: row.avg_possession
                }
            },
            attacking: {
                raw: {
                    shots: row.shots,
                    shots_on_goal: row.shots_on_goal,
                    xg: row.xg,
                    corner_kicks: row.corner_kicks
                },
                normalized: {
                    shots_per_game: row.shots_per_game,
                    shots_on_goal_per_game: row.shots_on_goal_per_game,
                    xg_per_game: row.xg_per_game,
                    big_chances_per_game: row.big_chances_per_game,
                    corners_per_game: row.corners_per_game,
                    offsides_per_game: row.offsides_per_game,
                    touches_in_box_per_game: row.touches_in_box_per_game
                },
                percentages: {
                    shot_accuracy: row.shot_accuracy,
                    goal_efficiency: row.goal_efficiency,
                    conversion_rate: row.conversion_rate
                }
            },
            defensive: {
                raw: {
                    fouls: row.fouls,
                    goalkeeper_saves: row.goalkeeper_saves
                },
                normalized: {
                    fouls_per_game: row.fouls_per_game,
                    saves_per_game: row.saves_per_game,
                    yellows_per_game: row.yellows_per_game,
                    clearances_per_game: row.clearances_per_game,
                    interceptions_per_game: row.interceptions_per_game,
                    tackles_per_game: row.tackles_per_game
                },
                percentages: {
                    tackle_success_rate: row.tackle_success_rate
                }
            },
            passing: {
                raw: {
                    passes_attempted: row.passes_attempted,
                    passes_completed: row.passes_completed
                },
                normalized: {
                    passes_per_game: row.passes_per_game,
                    passes_completed_per_game: row.passes_completed_per_game,
                    final_third_passes_per_game: row.final_third_passes_per_game,
                    crosses_per_game: row.crosses_per_game
                },
                percentages: {
                    pass_accuracy: row.pass_accuracy,
                    final_third_pass_accuracy: row.final_third_pass_accuracy,
                    cross_accuracy: row.cross_accuracy
                }
            }
        }));
        
        res.status(200).json({
            teams: transformedData,
            leagueAverages: leagueAverages
        });
    } catch (error) {
        console.error("Error fetching teams statistics:", error);
        res.status(500).json({ error: 'Failed to fetch team statistics' });
    }
}



export default {
    getTeams,
    getTeamSeasons,
    getTeamStatistics
}
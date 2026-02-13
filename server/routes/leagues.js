import express from 'express'
import leaguesController from '../controllers/leagues.js'

const router = express.Router()

router.get('/', leaguesController.getLeagues)
router.get('/:leagueId/seasons', leaguesController.getLeagueSeasons)
router.post('/:leagueId/standings', leaguesController.getLeagueStandings)

export default router
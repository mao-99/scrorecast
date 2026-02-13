import express from 'express'
import teamsController from '../controllers/teams.js'

const router = express.Router()

router.get('/', teamsController.getTeams);
router.post('/seasons', teamsController.getTeamSeasons);
router.post('/statistics', teamsController.getTeamStatistics);


export default router;
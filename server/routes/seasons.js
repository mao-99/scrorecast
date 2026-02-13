import express from 'express';
import seasonsController from '../controllers/seasons.js';

const router = express.Router();

// Get all seasons (optionally filtered by league via query param)
router.get('/', seasonsController.getSeasons);

// Get teams that participated in specific seasons
router.post('/teams', seasonsController.getSeasonTeams);

export default router;
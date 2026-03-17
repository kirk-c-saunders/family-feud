import express from 'express';
import {createGame, incorrectResponse, loadGame, revealOrHideAnswer, updateTeamInControl} from '../controllers/gameController.js';

const router = express.Router();

router.get('/', loadGame);

router.post('/', createGame);
router.post('/incorrectResponse/:publicCode', incorrectResponse);
router.post('/revealOrHideAnswer/:publicCode', revealOrHideAnswer);
router.post('/updateTeamInControl/:publicCode', updateTeamInControl);

export default router;
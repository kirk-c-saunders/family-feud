import express from 'express';
import {completeRound, createGame, incorrectResponse, loadGame, revealOrHideAnswer, setTimer, updateTeamInControl} from '../controllers/gameController.js';

const router = express.Router();

router.get('/', loadGame);

router.post('/', createGame);
router.post('/completeRound/:publicCode', completeRound)
router.post('/incorrectResponse/:publicCode', incorrectResponse);
router.post('/revealOrHideAnswer/:publicCode', revealOrHideAnswer);
router.post('/setTimer/:publicCode', setTimer);
router.post('/updateTeamInControl/:publicCode', updateTeamInControl);

export default router;
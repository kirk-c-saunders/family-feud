import express from 'express';
import {createGame, incorrectResponse, loadGame, revealOrHideAnswer} from '../controllers/gameController.js';

const router = express.Router();

router.get('/', loadGame);

router.post('/', createGame);
router.post('/incorrectResponse/:publicCode', incorrectResponse);
router.post('/revealOrHideAnswer/:publicCode', revealOrHideAnswer);

export default router;
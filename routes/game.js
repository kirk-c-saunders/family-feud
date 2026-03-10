import express from 'express';
import {createGame, loadGame, revealOrHideAnswer} from '../controllers/gameController.js';

const router = express.Router();

router.post('/', createGame);
router.get('/', loadGame);
router.post('/revealOrHideAnswer/:publicCode', revealOrHideAnswer);

export default router;
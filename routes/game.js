import express from 'express';
import {createGame, loadGame} from '../controllers/gameController.js';

const router = express.Router();

router.post('/', createGame);
router.get('/:publicCode', loadGame);

export default router;
import express from 'express';
import {createGame} from '../controllers/gameController.js';

const router = express.Router();

router.post('/createGame', createGame);




export default router;
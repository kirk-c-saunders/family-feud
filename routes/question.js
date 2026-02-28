import express from 'express';
import {getNextQuestion} from '../controllers/questionController.js';

const router = express.Router();

router.get('/nextQuestion', getNextQuestion);




export default router;
"use strict";

import path from 'path';
import { fileURLToPath } from 'url';
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getAllQuestions() {
    try {
        const questions = await fs.readFile(
            path.join(__dirname, "../", "json", "Questions.Json")
        );

        return questions;
    } catch (error) {
        console.error(error);
    }
}

export async function getNextQuestion (req, res, next) {
    try {
        const allQuestionsRaw = await getAllQuestions();
        const allQuestions = JSON.parse(allQuestionsRaw);
        
        if(Object.hasOwn('askedQuestions', req.body)) {            
            const availableQuestions = [];

            for (const question of allQuestions) {
                if (!req.body.askedQuestions.some(askedQuestion => askedQuestion == question.id)) {
                    availableQuestions.push(question);
                }
            }

            if(availableQuestions.length >= 1) {
                return res.status(200).json(availableQuestions[Math.floor(Math.random() * availableQuestions.length)]);
            } else {
                return res.status(400).json({error: "No remaining questions available to ask."});
            }
        } else {
            if (allQuestions.length >= 1) {
                return res.status(200).json(allQuestions[Math.floor(Math.random() * allQuestions.length)]);
            } else {
                return res.status(400).json({error: "No questions found to ask"});
            }
        }
    } catch (e) {
        console.log(e);
        const error = new Error(e);
        error.status = 500;
        return next(error);
    }
}
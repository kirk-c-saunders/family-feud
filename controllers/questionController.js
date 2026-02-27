"use strict";

import path from 'path';
import { fileURLToPath } from 'url';
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const foundQuestions = await getAllQuestions();

console.log(JSON.parse(foundQuestions));

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
    const allQuestions = await getAllQuestions();
    const availableQuestions = [];

    for (question of questions) {
        if (!req.body.askedQuestions.some(askedQuestion => askedQuestion.id = question.id)) {
            availableQuestions.push(question);
        }
    }

    return availableQuestions[(Math.random() * availableQuestions.length)]
}
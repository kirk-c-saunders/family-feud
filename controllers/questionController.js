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

export async function getNextQuestion(askedQuestions) {
    try {        
        const availableQuestions = [];

        if (typeof(askedQuestions) !== typeof([])) {
            throw new Error("askedQuestions is not an array");
        }

        const allQuestionsRaw = await getAllQuestions();
        const allQuestions = JSON.parse(allQuestionsRaw);

        for (const question of allQuestions) {
            if (!askedQuestions.some(askedQuestion => askedQuestion == question.id)) {
                availableQuestions.push(question);
            }
        }

        if(availableQuestions.length >= 1) {
            return availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        } else {
            throw new Error("No remaining questions available to ask.");
        }
    } catch (e) {
        throw e;
    }
}
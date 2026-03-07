"use strict";

import path from 'path';
import { fileURLToPath } from 'url';
import fs from "fs/promises";
import { type } from 'os';

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

export async function _getNextQuestion(askedQuestions) {
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

export async function getNextQuestion (req, res, next) {
    try {
        if(Object.hasOwn(req.body || {}, 'askedQuestions')) {
            return res.status(200).json(await _getNextQuestion(req.body.askedQuestions))
        } else {
            return res.status(200).json(await _getNextQuestion([]))
        }
    } catch (e) {
        console.log(e);
        const error = new Error(e);
        error.status = 500;
        return next(error);
    }
}
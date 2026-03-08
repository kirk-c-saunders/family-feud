"use strict";

import path from 'path';
import { fileURLToPath, parse } from 'url';
import {getNextQuestion} from './questionController.js';
import fs from "fs/promises";
import { url } from 'inspector';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function gameFilePath(publicCode) {
    return path.join(__dirname, "../", "json", "games", `${publicCode}.json`);
}

async function getNextQuestionForGame(askedQuestions) {
    const question = await getNextQuestion(askedQuestions);

    question.answers.forEach(answer => {
        answer.answered = false;
    });

    return question;
}

export async function createGame(req, res, next) {
    if(!Object.hasOwn(req.body, 'name')){
        const error = new Error(`Game Name is Required`);
        error.status = 400;
        return next(error);
    }

    if(!Object.hasOwn(req.body, 'team1')){
        const error = new Error(`Team 1 is Required`);
        error.status = 400;
        return next(error);
    }

    if(!Object.hasOwn(req.body, 'team2')){
        const error = new Error(`Team 2 is Required`);
        error.status = 400;
        return next(error);
    }

    try {
        const game = {};
        const team1 = {};
        const team2 = {};

        //a random 4 character hexidecimal (with enough leading 0s) to identify the game
        const publicCode = Math.floor(Math.random() * 65535).toString(16).padStart(4,"0");
        const hostCode = crypto.randomUUID();

        team1.activePlayerIndex = 0;
        team1.name = req.body.team1.name;
        team1.players = req.body.team1.players || [];
        team1.score = 0;

        team2.activePlayerIndex = 0;
        team2.name = req.body.team2.name;
        team2.players = req.body.team2.players || [];
        team2.score = 0;
        
        game.askedQuestions = [];
        game.hostCode = hostCode
        game.name = req.body.name;
        game.round = {};
        game.team1 = team1;
        game.team2 = team2;
        game.teamInControl = 1;

        game.round.question = await getNextQuestionForGame(game.askedQuestions);
        game.round.incorrectResponseCount = 0;

        await fs.writeFile(gameFilePath(publicCode), JSON.stringify(game, null, 2));
        
        res.status(200).json({publicCode: publicCode, hostCode: hostCode});
    } catch (e) {
        const error = new Error(`Error creating game: ${e}`);
        error.status = 500;
        return next(error);
    }
}

export async function loadGame(req, res, next) {
    try {
        const queryParameters = parse(req.url, true).query;
        const publicCode = queryParameters.publicCode;
        let gameRaw = "";
        
        try {
            gameRaw = await fs.readFile(gameFilePath(publicCode));
        } catch {
            const error = new Error(`A game with the code of ${publicCode} was not found`);
            error.status = 404;
            return next(error);
        }

        const game = JSON.parse(gameRaw);
        delete game.round.question.id; //remove the question's ID from the output since the game doesn't need it
        delete game.askedQuestions; //remove the list of asked questions since the player/host doesn't need it

        if(Object.hasOwn(queryParameters || {}, "hostCode")) {
            game.isAuthorizedHost = queryParameters.hostCode === game.hostCode ? true : false;
        } else {
            game.isAuthorizedHost = false;
        }

        delete game.hostCode; //remove the hostCode property once we are done processing it so we don't risk sharing it.
        
        if(!game.isAuthorizedHost){
            /*
                If the user is not the host, don't return data about un-answered answers
                (hopefully) preventing the more tech-savvy players from finding answers early
            */
            game.round.question.answers.forEach(answer => {
                if(!answer.answered) {
                    answer.points = null;
                    answer.text = null;
                }
            });
        }

        res.status(200).json(game);
    } catch (e) {
        const error = new Error(`Error loading game: ${e}`);
        error.status = 500;
        return next(error);
    }

}
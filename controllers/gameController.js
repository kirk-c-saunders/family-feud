"use strict";

import path from 'path';
import { fileURLToPath, parse } from 'url';
import {getNextQuestion} from './questionController.js';
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function completeRound(req, res, next) {
    try {
        const publicCode = req.params.publicCode;
        let hostCode = "";
        let roundScore = 0;

        if(!Object.hasOwn(req.body, 'winningTeam')){
            const error = new Error(`winningTeam is Required`);
            error.status = 400;
            return next(error);
        }
        const winningTeam = parseInt(req.body.winningTeam);

        if(winningTeam !== 1 && winningTeam!==2) {
            const error = new Error(`winningTeam must be either 1 or 2`);
            error.status = 400;
            return next(error);
        }

        if(Object.hasOwn(req.body, 'hostCode')){
            hostCode = req.body.hostCode;
        }

        const game = await readGameFile(publicCode);

        if(hostCode !== game.hostCode) {
            const error = new Error(`Incorrect Host Code`);
            error.status = 400;
            return next(error);
        }

        for (let i = 0; i < game.round.question.answers.length; i++) {
            if (game.round.question.answers[i].answered) {
                roundScore += game.round.question.answers[i].points;
            }
        }

        if(winningTeam === 1) {
            game.team1.score += roundScore;
        } else {
            game.team2.score += roundScore;
        }

        game.askedQuestions.push(game.round.question.id);

        console.log(`updated asked questions - ${game.askedQuestions}`);

        game.round.question = await getNextQuestionForGame(game.askedQuestions);
        game.round.incorrectResponseCount = 0;

        game.teamInControl = null;

        await updateGameDataFile(publicCode, game);

        res.status(200).json({winningTeam: winningTeam});
    } catch (e) {
        const error = new Error(`Error completing round: ${e}`);
        error.status = 500;
        return next(error);
    }
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
        game.teamInControl = null;

        game.round.question = await getNextQuestionForGame(game.askedQuestions);
        game.round.incorrectResponseCount = 0;

        await updateGameDataFile(publicCode, game);
        
        res.status(200).json({publicCode: publicCode, hostCode: hostCode});
    } catch (e) {
        const error = new Error(`Error creating game: ${e}`);
        error.status = 500;
        return next(error);
    }
}

export async function incorrectResponse (req, res, next) {
    const publicCode = req.params.publicCode;
    let hostCode = "";

    if(Object.hasOwn(req.body, 'hostCode')){
        hostCode = req.body.hostCode;
    }

    const game = await readGameFile(publicCode);

    if(hostCode !== game.hostCode) {
        const error = new Error(`Incorrect Host Code`);
        error.status = 400;
        return next(error);
    }

    if(game.round.incorrectResponseCount >= 3) {
        const error = new Error(`Round already has 3+ incorrect responses`);
        error.status = 400;
        return next(error);
    } else {
        game.round.incorrectResponseCount++;

        updateActivePlayer (game, true);

        await updateGameDataFile(publicCode, game);
        
        res.status(200).json({"incorrectResponseCount":`${game.round.incorrectResponseCount}`});
    }
}

export async function loadGame(req, res, next) {
    try {
        const queryParameters = parse(req.url, true).query;
        const publicCode = queryParameters.publicCode;

        const game = await readGameFile(publicCode);
        
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

export async function revealOrHideAnswer (req, res, next) {
    try {
        const publicCode = req.params.publicCode;
        let hostCode = "";
        
        if(!Object.hasOwn(req.body, 'isReveal')){
            const error = new Error(`isReveal is Required`);
            error.status = 400;
            return next(error);
        }
        const isReveal = req.body.isReveal;

        if(!Object.hasOwn(req.body, 'answerIndex')){
            const error = new Error(`answer index is Required`);
            error.status = 400;
            return next(error);
        }
        const answerIndex = parseInt(req.body.answerIndex);
        
        if(Object.hasOwn(req.body, 'hostCode')){
            hostCode = req.body.hostCode;
        }

        const game = await readGameFile(publicCode);

        if(hostCode !== game.hostCode) {
            const error = new Error(`Incorrect Host Code`);
            error.status = 400;
            return next(error);
        }

        if(answerIndex < 0 || game.round.question.answers.length <= answerIndex) {
            const error = new Error(`Provided answer number does not exist on the game's current question`);
            error.status = 400;
            return next(error);
        }

        game.round.question.answers[answerIndex].answered = isReveal;

        updateActivePlayer (game, isReveal)

        await updateGameDataFile(publicCode, game);
        
        res.status(200).json({answerIndex: answerIndex, isReveal: isReveal});
    } catch (e) {
        const error = new Error(`Error revealing or hiding answer: ${e}`);
        error.status = 500;
        return next(error);
    }
}

export async function setTimer(req, res, next) {
    try {
        const publicCode = req.params.publicCode;
        let hostCode = "";
        
        if(!Object.hasOwn(req.body, 'timerLengthInSeconds')){
            const error = new Error(`timerLengthInSeconds is Required`);
            error.status = 400;
            return next(error);
        }
        const timerLengthInSeconds = parseInt(req.body.timerLengthInSeconds);

        if(Object.hasOwn(req.body, 'hostCode')){
            hostCode = req.body.hostCode;
        }

        const game = await readGameFile(publicCode);

        if(hostCode !== game.hostCode) {
            const error = new Error(`Incorrect Host Code`);
            error.status = 400;
            return next(error);
        }

        const timerEndDateTime = new Date(Date.now() + (timerLengthInSeconds * 1000));

        game.timerEndDateTime = timerEndDateTime.toISOString();

        await updateGameDataFile(publicCode, game);

        res.status(200).json({timerEndDateTime: timerEndDateTime});
    }  catch (e) {
        const error = new Error(`Error updating timer end date time: ${e}`);
        error.status = 500;
        return next(error);
    }
}

export async function updateTeamInControl(req, res, next) {
    try {
        const publicCode = req.params.publicCode;
        let hostCode = "";

        if(!Object.hasOwn(req.body, 'teamInControl')){
            const error = new Error(`teamInControl is Required`);
            error.status = 400;
            return next(error);
        }
        const teamInControl = parseInt(req.body.teamInControl);

        if(teamInControl !== 1 && teamInControl!==2) {
            const error = new Error(`teamInControl must be either 1 or 2`);
            error.status = 400;
            return next(error);
        }
        
        if(Object.hasOwn(req.body, 'hostCode')){
            hostCode = req.body.hostCode;
        }

        const game = await readGameFile(publicCode);

        if(hostCode !== game.hostCode) {
            const error = new Error(`Incorrect Host Code`);
            error.status = 400;
            return next(error);
        }

        game.teamInControl = teamInControl;

        await updateGameDataFile(publicCode, game);

        res.status(200).json({teamInControl: teamInControl});
    } catch (e) {
        const error = new Error(`Error updating team in control: ${e}`);
        error.status = 500;
        return next(error);
    }
}

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

async function readGameFile(publicCode) {
    try {
        const gameRaw = await fs.readFile(gameFilePath(publicCode));
        return JSON.parse(gameRaw);
    } catch {
        const error = new Error(`A game with the code of ${publicCode} was not found`);
        error.status = 404;
        return next(error);
    }
}

function updateActivePlayer (game, isNextPlayer = true) {
    if (typeof isNextPlayer !== "boolean") {
        throw new Error("Improper value for isNextPlayer");
    }

    let activePlayerIndex;
    let totalPlayerCount;

    if (game.teamInControl === 1) {
        activePlayerIndex = game.team1.activePlayerIndex;
        totalPlayerCount = game.team1.players.length;
    } else { //implicit - game.teamInControl === 2
        activePlayerIndex = game.team2.activePlayerIndex;
        totalPlayerCount = game.team2.players.length;
    }

    if (totalPlayerCount < 1) {
        activePlayerIndex = 0;
    } else if(isNextPlayer) {
        activePlayerIndex++;
        if (activePlayerIndex >= totalPlayerCount) {
            activePlayerIndex = 0;
        }
    } else {
        activePlayerIndex--;
        if(activePlayerIndex < 0) {
            activePlayerIndex = totalPlayerCount - 1;
        }
    }

    if (game.teamInControl === 1) {
        game.team1.activePlayerIndex = activePlayerIndex;
    } else { //implicit - gameData.teamInControl === 2
        game.team2.activePlayerIndex = activePlayerIndex;
    }
}

async function updateGameDataFile(publicCode, game) {
    await fs.writeFile(gameFilePath(publicCode), JSON.stringify(game, null, 2));
}
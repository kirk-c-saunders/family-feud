"use strict";

import path from 'path';
import { fileURLToPath } from 'url';
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
        const game = [];
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

        await fs.writeFile(path.join(__dirname, "../", "json", "games", `${publicCode}.json`), game)

        res.status(200).json({publicCode: publicCode, hostCode: hostCode});
    } catch (e) {
        const error = new Error(`Error creating game: ${e}`);
        error.status = 500;
        return next(error);
    }
}
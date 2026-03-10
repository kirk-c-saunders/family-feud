import { hostCodeLocalStorageKey } from "./globalVariables.js";
const publicCode = new URLSearchParams(window.location.search).get("publicCode");
let gameData = {};
const answerGrid = document.getElementById("answer-grid");

if(!publicCode) {
    console.error("Game's public code is needed in the URL in order to play");
}

const hostCode = localStorage.getItem(`game-${publicCode}-hostCode`) || "";

answerGrid.addEventListener("click", (e) => {
    const regex = new RegExp("answer-.*");

    if(regex.test(e.target.id))
    {
        const targetIdSplit = e.target.id.split('-');
        const clickedAnswer = document.getElementById(`${targetIdSplit[0]}-${targetIdSplit[1]}`);
        const answerNumber = parseInt(targetIdSplit[1], 10);
        clickedAnswer.classList.toggle("hidden-answer");
    }
})

loadPage();

async function loadPage() {
    const queryParameters = new URLSearchParams({
        publicCode,
        hostCode
    });
    
    const response = await fetch(`./api/game/?${queryParameters.toString()}`, {
        method: "GET",
        headers: {"Content-Type": "application/json"}
    });

    if(!response.ok) {
        alert("Failed to load game.");
    } else {
        gameData = await response.json();
    }

    /*
        Now that we have all the game data we need to replace all the below fields
        - Game Name
        - Both Team's: Names, Scores, On Deck Player
        - Question String
        - Game Score
        - Number of Incorrect Responses
        - Answers
    */
    setInnerTextByElementId("game-name", gameData.name);
    
    setInnerTextByElementId("team-1-name-mobile", gameData.team1.name);
    setInnerTextByElementId("team-1-score-mobile", gameData.team1.score);
    if (gameData.team1.players.length >= 1) {
        setInnerTextByElementId("team-1-current-player-mobile", gameData.team1.players[gameData.team1.activePlayerIndex]);
    }

    setInnerTextByElementId("team-1-name-desktop", gameData.team1.name);
    setInnerTextByElementId("team-1-score-desktop", gameData.team1.score);
    addPlayersToDesktopPlayerList (1, gameData.team1.players, gameData.team1.activePlayerIndex);


    setInnerTextByElementId("team-2-name-mobile", gameData.team2.name);
    setInnerTextByElementId("team-2-score-mobile", gameData.team2.score);
    if (gameData.team2.players.length >= 1) {
        setInnerTextByElementId("team-2-current-player-mobile", gameData.team2.players[gameData.team2.activePlayerIndex]);
    }

    setInnerTextByElementId("team-2-name-desktop", gameData.team2.name);
    setInnerTextByElementId("team-2-score-desktop", gameData.team2.score);
    addPlayersToDesktopPlayerList (2, gameData.team2.players, gameData.team2.activePlayerIndex);

    assignControlToTeam(gameData.teamInControl);

    setInnerTextByElementId("question", gameData.round.question.question);

    setInnerTextByElementId("timer", "3:00");
    let roundScore = 0;
    for (let i = 0; i < gameData.round.question.answers.length; i++) {
        if(gameData.round.question.answers[i].answered) {
            roundScore += parseInt(gameData.round.question.answers[i].points);
        }
    }
    setInnerTextByElementId("round-score", roundScore);
    setInnerTextByElementId("incorrect-response-count", "".padStart(gameData.round.incorrectResponseCount, "X"));

    for (let i = 0; i < gameData.round.question.answers.length; i++) {
        addAnswer (gameData.round.question.answers[i], i);
    }

    setInnerTextByElementId("team-1-wins-round", `${gameData.team1.name} Wins Round`);
    setInnerTextByElementId("team-2-wins-round", `${gameData.team2.name} Wins Round`);
}

function setInnerTextByElementId (elementId, innerTextValue) {
    document.getElementById(elementId).innerText = innerTextValue;
}

function addAnswer (answer, answerNumber) {
    /*
        Each answer is structured like so:

        <div id="answer-1" class="hover hidden-answer">
            <div id="answer-1-text">As much as they want</div>
            <div id="answer-1-points">50</div>
        </div>
    */
    const text = document.createElement("div");
    const points = document.createElement("div");
    const wrapper = document.createElement("div");

    text.innerText = answer.text || "";
    text.id = `answer-${answerNumber}-text`;

    points.innerText = answer.points || "";
    points.id = `answer-${answerNumber}-points`;
    
    wrapper.id = `answer-${answerNumber}`;
    wrapper.classList.add("hover");
    if(!answer.answered) {
        wrapper.classList.add("hidden-answer");
    }
    wrapper.appendChild(text);
    wrapper.appendChild(points);

    answerGrid.appendChild(wrapper);
}

function addPlayersToDesktopPlayerList (teamNumber, playerList, activePlayerIndex = 0) {
    /*
        A completed team list should look something like:
        <ul id="team-1-player-list">
            <li id="team-1-player-1" class="selected-player">Kirk</li>
            <li id="team-1-player-2">Clifford</li>
            <li id="team-1-player-3">Saunders</li>
        </ul>
    */
    const listElement = document.getElementById(`team-${teamNumber}-player-list`);

    for (let i = 0; i < playerList.length; i++) {
        const player = document.createElement("li");
        player.id = `team-${teamNumber}-player-${i}`;
        player.innerText = playerList[i];

        if(i===activePlayerIndex) {
            player.classList.add("selected-player");
        }

        listElement.appendChild(player);
    }
}

function assignControlToTeam (teamNumber) {
    if (teamNumber === 1) {
        document.getElementById("team-1-mobile").classList.add("team-in-control");
        document.getElementById("team-1-desktop").classList.add("team-in-control");
        document.getElementById("team-2-mobile").classList.remove("team-in-control");
        document.getElementById("team-2-desktop").classList.remove("team-in-control");
    } else {
        document.getElementById("team-1-mobile").classList.remove("team-in-control");
        document.getElementById("team-1-desktop").classList.remove("team-in-control");
        document.getElementById("team-2-mobile").classList.add("team-in-control");
        document.getElementById("team-2-desktop").classList.add("team-in-control");
    }
}
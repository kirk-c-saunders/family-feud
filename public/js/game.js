import { hostCodeLocalStorageKey } from "./globalVariables.js";
const publicCode = new URLSearchParams(window.location.search).get("publicCode");
const answerGrid = document.getElementById("answer-grid");
const timer = document.getElementById("timer");
const timerLengthInSeconds = 45;
const resetTimerString = "Click to Start Timer";

if(!publicCode) {
    console.error("Game's public code is needed in the URL in order to play");
}

const hostCode = localStorage.getItem(hostCodeLocalStorageKey(publicCode)) || "";

const gameData = await populateGameData();
await initialPageLoad();

if (gameData.isAuthorizedHost) {
    timer.addEventListener("click", async () => {
        if (gameData.teamInControl) {
            await setTimer(timerLengthInSeconds)
        } else {
            alertToPickTeamInControl();
        }
    });
    
    answerGrid.addEventListener("click", async (e) => {
        if(gameData.teamInControl) {
            const regex = new RegExp("answer-.*");

            if(regex.test(e.target.id))
            {
                const targetIdSplit = e.target.id.split('-');
                const clickedAnswer = document.getElementById(`${targetIdSplit[0]}-${targetIdSplit[1]}`);
                const answerIndex = parseInt(targetIdSplit[1], 10);

                if(!gameData.round.question.answers[answerIndex].answered) {
                    await revealOrHideAnswer (answerIndex, true);
                    gameData.round.question.answers[answerIndex].answered = true;
                    clickedAnswer.classList.add("shown-answer");
                    updateActivePlayer(true);
                    await setTimer(timerLengthInSeconds)
                } else {
                    await revealOrHideAnswer (answerIndex, false);
                    gameData.round.question.answers[answerIndex].answered = false;
                    clickedAnswer.classList.remove("shown-answer");
                    updateActivePlayer(false);
                }

                setInnerTextByElementId("round-score", calculateRoundScore());
            }
        } else {
            alertToPickTeamInControl();
        }
    })

    document.getElementById("incorrect-anwer").addEventListener("click", async () => {
        if(gameData.teamInControl){
            if(gameData.round.incorrectResponseCount <= 2) {
                const incorrectResponseCountRaw = await incorrectResponse();
                gameData.round.incorrectResponseCount = parseInt(incorrectResponseCountRaw.incorrectResponseCount);

                updateActivePlayer(true);
                setIncorrectResponseXs();
                if(gameData.round.incorrectResponseCount === 3) {
                    if(gameData.teamInControl === 1) {
                        await updateTeamInControl(2);
                    } else {
                        await updateTeamInControl(1);
                    }
                }
                await setTimer(timerLengthInSeconds)
            } else {
                alert("Already have 3 incorrect responses.")
            }
        } else {
            alertToPickTeamInControl();
        }
    });

    document.getElementById("team-1-desktop").addEventListener("click", async() =>{
        if(gameData.teamInControl !== 1) {
            await updateTeamInControl(1);
        }
    });

    document.getElementById("team-1-mobile").addEventListener("click", async() =>{
        if(gameData.teamInControl !== 1) {
            await updateTeamInControl(1);
        }
    });

    document.getElementById("team-2-mobile").addEventListener("click", async() =>{
        if(gameData.teamInControl !== 2) {
            await updateTeamInControl(2);
        }
    });

    document.getElementById("team-2-desktop").addEventListener("click", async() =>{
        if(gameData.teamInControl !== 2) {
            await updateTeamInControl(2);
        }
    });

    document.getElementById("team-1-wins-round").addEventListener("click", async() => {
        await completeRound(1);
    });

    document.getElementById("team-2-wins-round").addEventListener("click", async() => {
        await completeRound(2);
    });
} 
else {
    await refreshPageLoop();
}

function addAnswer (answer, answerNumber) {
    /*
        Each answer is structured like so:

        <div id="answer-1" class="hover shown-answer">
            <div id="answer-1-text">As much as they want</div>
            <div id="answer-1-points">50</div>
        </div>
    */
    const textId = `answer-${answerNumber}-text`;
    const pointsId = `answer-${answerNumber}-points`;
    const wrapperId = `answer-${answerNumber}`;

    let text = document.getElementById(textId);
    let points = document.getElementById(pointsId);
    let wrapper = document.getElementById(wrapperId);

    if(!wrapper) {
        text = document.createElement("div");
        points = document.createElement("div");
        wrapper = document.createElement("div");

        text.innerText = answer.text || "";
        text.id = textId;

        points.innerText = answer.points || "";
        points.id = pointsId;
        
        wrapper.id = wrapperId;
        if (gameData.isAuthorizedHost) {
            wrapper.classList.add("hover");
            if(answer.answered) {
                wrapper.classList.add("shown-answer");
            }
        }
        wrapper.appendChild(text);
        wrapper.appendChild(points);

        answerGrid.appendChild(wrapper);
    }
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

    listElement.replaceChildren();

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

function alertToPickTeamInControl() {
    alert("Please select a team to be in control of the round before proceeding.");
}

function assignControlToTeam (teamNumber) {
    if (teamNumber === 1) {
        document.getElementById("team-1-mobile").classList.add("team-in-control");
        document.getElementById("team-1-desktop").classList.add("team-in-control");
        document.getElementById("team-2-mobile").classList.remove("team-in-control");
        document.getElementById("team-2-desktop").classList.remove("team-in-control");
    } else if (teamNumber === 2) {
        document.getElementById("team-1-mobile").classList.remove("team-in-control");
        document.getElementById("team-1-desktop").classList.remove("team-in-control");
        document.getElementById("team-2-mobile").classList.add("team-in-control");
        document.getElementById("team-2-desktop").classList.add("team-in-control");
    } else {
        document.getElementById("team-1-mobile").classList.remove("team-in-control");
        document.getElementById("team-1-desktop").classList.remove("team-in-control");
        document.getElementById("team-2-mobile").classList.remove("team-in-control");
        document.getElementById("team-2-desktop").classList.remove("team-in-control");
    }
}

function calculateRoundScore () {
    let roundScore = 0;

    for (let i = 0; i < gameData.round.question.answers.length; i++) {
        if(gameData.round.question.answers[i].answered) {
            roundScore += parseInt(gameData.round.question.answers[i].points);
        }
    }

    return roundScore;
}

async function completeRound(winningTeam) {
    await setTimer(null);
    timer.innerText = resetTimerString;
    
    const response = await fetch(`./api/game/completeRound/${publicCode}`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({hostCode, winningTeam})
    });

    if(!response.ok) {
        alert("Failed to complete round.");
    } else {
        await pageRefresh();
        return await response.json();
    }
}

function displayTimer() {
    if(Object.hasOwn(gameData, 'timerEndDateTime')){
        if(gameData.timerEndDateTime) {
            const timerEndDateTime = new Date(gameData.timerEndDateTime);

            if(timerEndDateTime > Date.now()) {
                timer.innerText = `${Math.floor((timerEndDateTime - Date.now()) / 1000)}`;
            } else {
                timer.innerText = "0";
                gameData.timerEndDateTime = null; //This should make this function faster by doing 2 if checks and nothing else.
            }
        } else if (timer.innerText !== "0" && timer.innerText !== resetTimerString) {
            timer.innerText = "0";
        }
    }

    setTimeout(displayTimer, 1000);
}

async function incorrectResponse() {
    const response = await fetch(`./api/game/incorrectResponse/${publicCode}`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({hostCode})
    });

    if(!response.ok) {
        alert("Failed to update answer.");
    } else {
        return await response.json();
    }
}

async function initialPageLoad() {
    /*
        Now that we have all the game data we need to replace all the below fields
        - Game Name
        - Both Team's: Names

        Then manage the buttons (are they available or not)
    */
    setInnerTextByElementId("game-name", gameData.name);
    
    setInnerTextByElementId("team-1-name-mobile", gameData.team1.name);
    setInnerTextByElementId("team-1-name-desktop", gameData.team1.name);

    setInnerTextByElementId("team-2-name-mobile", gameData.team2.name);
    setInnerTextByElementId("team-2-name-desktop", gameData.team2.name);

    if(gameData.isAuthorizedHost) {
        setInnerTextByElementId("team-1-wins-round", `${gameData.team1.name} - Wins Round`);
        setInnerTextByElementId("team-2-wins-round", `${gameData.team2.name} - Wins Round`);
        document.getElementById("team-1-mobile").classList.add("hover");
        document.getElementById("team-1-desktop").classList.add("hover");
        document.getElementById("team-2-mobile").classList.add("hover");
        document.getElementById("team-2-desktop").classList.add("hover");
        timer.classList.add("hover");
        timer.innerText = resetTimerString;
    } else {
        document.getElementById("team-1-wins-round").remove();
        document.getElementById("incorrect-anwer").remove();
        document.getElementById("team-2-wins-round").remove();
    }

    displayTimer();

    await pageRefresh();
}

async function pageRefresh(refreshGameData = true) {
    if (refreshGameData) {
        Object.assign(gameData, await populateGameData());
    }

    /*
        Now that we have all the game data we need to replace all the below fields
        - Both Team's: Scores, On Deck Player
        - Team in control
        - Question String
        - Game Score
        - Number of Incorrect Responses
        - Answers
    */

    setInnerTextByElementId("team-1-score-mobile", gameData.team1.score);
    if (gameData.team1.players.length >= 1) {
        setInnerTextByElementId("team-1-current-player-mobile", gameData.team1.players[gameData.team1.activePlayerIndex]);
    }
    setInnerTextByElementId("team-1-score-desktop", gameData.team1.score);
    addPlayersToDesktopPlayerList (1, gameData.team1.players, gameData.team1.activePlayerIndex);

    setInnerTextByElementId("team-2-score-mobile", gameData.team2.score);
    if (gameData.team2.players.length >= 1) {
        setInnerTextByElementId("team-2-current-player-mobile", gameData.team2.players[gameData.team2.activePlayerIndex]);
    }
    setInnerTextByElementId("team-2-score-desktop", gameData.team2.score);
    addPlayersToDesktopPlayerList (2, gameData.team2.players, gameData.team2.activePlayerIndex);

    assignControlToTeam(gameData.teamInControl);

    setInnerTextByElementId("question", gameData.round.question.question);
    
    setInnerTextByElementId("round-score", calculateRoundScore());
    setIncorrectResponseXs();

    setAnswersGrid(false);
}

async function populateGameData() {
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
        return await response.json();
    }
}

async function refreshPageLoop () {
    try {
        await pageRefresh();
    } catch (e) {
        console.error('Error in page refresh in loop function:', e);
    }

    setTimeout(refreshPageLoop, 1500);
}

async function revealOrHideAnswer (answerIndex, isReveal) {
    const response = await fetch(`./api/game/revealOrHideAnswer/${publicCode}`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({hostCode, isReveal, answerIndex})
    });

    if(!response.ok) {
        alert("Failed to update answer.");
    } else {
        return await response.json();
    }
}

function setAnswersGrid () {
    answerGrid.replaceChildren();
    
    for (let i = 0; i < gameData.round.question.answers.length; i++) {
        addAnswer (gameData.round.question.answers[i], i);
    }
}

function setIncorrectResponseXs () {
    setInnerTextByElementId("incorrect-response-count", "".padStart(gameData.round.incorrectResponseCount, "X").substring(0,3));
}

function setInnerTextByElementId (elementId, innerTextValue) {
    document.getElementById(elementId).innerText = innerTextValue;
}

async function setTimer (timerLengthInSeconds) {
    const response = await fetch(`./api/game/setTimer/${publicCode}`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({hostCode, timerLengthInSeconds})
    });

    if(!response.ok) {
        alert("Failed to set timer.");
    } else {
        const responseOutput = await response.json();
        gameData.timerEndDateTime = responseOutput.timerEndDateTime;
        return responseOutput;
    }
}

async function updateActivePlayer(isNextPlayer = true) {
    if(gameData.teamInControl === 1) {
        if(isNextPlayer) {
            gameData.team1.activePlayerIndex++;
            
            if(gameData.team1.activePlayerIndex >= gameData.team1.players.length) {
                gameData.team1.activePlayerIndex = 0;
            }
        } else {
            gameData.team1.activePlayerIndex--;

            if(gameData.team1.activePlayerIndex < 0) {
                gameData.team1.activePlayerIndex = gameData.team1.players.length - 1;
            }
        }

        if (gameData.team1.players.length >= 1) {
            setInnerTextByElementId("team-1-current-player-mobile", gameData.team1.players[gameData.team1.activePlayerIndex]);
        }
        addPlayersToDesktopPlayerList (1, gameData.team1.players, gameData.team1.activePlayerIndex);
    } else { //implicit gameData.teamInControl === 2
        if(isNextPlayer) {
            gameData.team2.activePlayerIndex++;
            
            if(gameData.team2.activePlayerIndex >= gameData.team2.players.length) {
                gameData.team2.activePlayerIndex = 0;
            }
        } else {
            gameData.team2.activePlayerIndex--;

            if(gameData.team2.activePlayerIndex < 0) {
                gameData.team2.activePlayerIndex = gameData.team2.players.length - 1;
            }
        }

        if (gameData.team2.players.length >= 1) {
            setInnerTextByElementId("team-2-current-player-mobile", gameData.team2.players[gameData.team2.activePlayerIndex]);
        }
        addPlayersToDesktopPlayerList (2, gameData.team2.players, gameData.team2.activePlayerIndex);
    }
}

async function updateTeamInControl(teamInControl) {
    const response = await fetch(`./api/game/updateTeamInControl/${publicCode}`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({hostCode, teamInControl})
    });

    if(!response.ok) {
        alert("Failed to update team in control.");
    } else {
        gameData.teamInControl = teamInControl;
        assignControlToTeam(teamInControl)
        return await response.json();
    }
}
import { apiUrlRoot, hostCodeLocalStorageKey } from "./globalVariables.js";

const team1NameTextBox = document.getElementById("team-1-name")
const team1AddPlayerTextBox = document.getElementById("add-team-1-player-textbox");
const team1PlayerList = document.getElementById("team-1-player-list");

const team2AddPlayerTextBox = document.getElementById("add-team-2-player-textbox");
const team2PlayerList = document.getElementById("team-2-player-list");

document.getElementById("add-team-1-player-button").addEventListener("click", () => addPlayer(team1AddPlayerTextBox, team1PlayerList));
document.getElementById("remove-team-1-player-button").addEventListener("click", () => removePlayer(team1PlayerList));
document.getElementById("add-team-2-player-button").addEventListener("click", () => addPlayer(team2AddPlayerTextBox, team2PlayerList));
document.getElementById("remove-team-2-player-button").addEventListener("click", () => removePlayer(team2PlayerList));
document.getElementById("create-game-form").addEventListener("submit", async function (e){
    /*
        1) Prevent default form submission behavior (so the page doesn't refresh)
        2) Create game object with form data and player lists
        3) Send POST request to API to create game
        4) If successful, save host secret and redirect to game page with new game ID
    */
    e.preventDefault();

    const gameFormData = Object.fromEntries(new FormData(e.target).entries());
    
    const game = {name: gameFormData.name};
    game.team1 = {
        name: gameFormData["team-1-name"],
        players: Array.from(team1PlayerList.children).map(player => player.textContent) //AI Use - Modified Copilot suggestion
    };
    game.team2 = {
        name: gameFormData["team-2-name"],
        players: Array.from(team2PlayerList.children).map(player => player.textContent) //AI Use - Modified Copilot suggestion
    };

    const response = await fetch(`${apiUrlRoot}/api/game`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(game)
    });

    if(!response.ok) {
        alert("Failed to create game.");
    } else {
        const gameData = await response.json();
        localStorage.setItem(hostCodeLocalStorageKey(gameData.publicCode), gameData.hostCode);
        window.location.href = `game.html?gameId=${gameData.publicCode}`;
    }
})

function addPlayer(playerNameTextBox, playerList) {
    if (playerNameTextBox.value === "") {
        alert("Please provide team member name before submitting.")
    } else {
        const player = document.createElement("li");
        player.textContent = playerNameTextBox.value;

        playerNameTextBox.value = "";

        playerList.appendChild(player);
    }
}

function removePlayer(playerList) {
    const lastPlayerInPlayerList = playerList.lastElementChild;
    if(!lastPlayerInPlayerList) {
        alert("No players assigned to the team to remove.")
    } else { 
        lastPlayerInPlayerList.remove();
    }
}
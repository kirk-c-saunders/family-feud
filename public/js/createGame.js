const gameNameTextBox = document.getElementById("name");
const createGameButton = document.getElementById("create-game");

const team1NameTextBox = document.getElementById("team-1-name")
const team1AddPlayerTextBox = document.getElementById("add-team-1-player-textbox");
const team1AddPlayerButton = document.getElementById("add-team-1-player-button");
const team1PlayerList = document.getElementById("team-1-player-list");
const team1RemovePlayerButton = document.getElementById("remove-team-1-player-button");

const team2NameTextBox = document.getElementById("team-2-name")
const team2AddPlayerTextBox = document.getElementById("add-team-2-player-textbox");
const team2AddPlayerButton = document.getElementById("add-team-2-player-button");
const team2PlayerList = document.getElementById("team-2-player-list");
const team2RemovePlayerButton = document.getElementById("remove-team-2-player-button");

team1AddPlayerButton.addEventListener("click", () => addPlayer(team1AddPlayerTextBox, team1PlayerList));
team1RemovePlayerButton.addEventListener("click", () => removePlayer(team1PlayerList));
team2AddPlayerButton.addEventListener("click", () => addPlayer(team2AddPlayerTextBox, team2PlayerList));
team2RemovePlayerButton.addEventListener("click", () => removePlayer(team2PlayerList));

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
import { hostCodeLocalStorageKey } from "./globalVariables.js";
const publicCode = new URLSearchParams(window.location.search).get("publicCode");

if(!publicCode) {
    console.error("Game's public code is needed in the URL in order to play");
}

const hostCode = localStorage.getItem(`game-${publicCode}-hostCode`) || "";

document.getElementById("answer-grid").addEventListener("click", (e) => {
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
    const response = await fetch(`./api/game/${publicCode}`, {
        method: "GET",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({"hostCode":hostCode})
    });

    if(!response.ok) {
        alert("Failed to load game.");
    } else {
        const gameData = await response.json();
        console.log(gameData);
    }
}
import { hostCodeLocalStorageKey } from "./globalVariables.js";
const gameCode = new URLSearchParams(window.location.search).get("gameCode");

if(!gameCode) {
    console.error("game code is needed in the URL in order to play");
}


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
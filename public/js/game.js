import { hostCodeLocalStorageKey } from "./globalVariables.js";

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
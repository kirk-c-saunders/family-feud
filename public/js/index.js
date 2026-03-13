document.getElementById("join-game").addEventListener ("click", () => {
    const publicCode = document.getElementById("game-public-code-textbox").value;

    window.location = `game.html?publicCode=${publicCode}`;
})
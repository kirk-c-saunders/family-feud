function addRowHandlers() {
    
}
function ToggleBackgroundColor(IdName, IsRevealOnly) {
    var x = document.getElementById(IdName);
    if (x) { //only do something if the element exists (so we don't throw errors)
        if (IsRevealOnly == true) {
            x.classList.add("answeredAnswer");
        }
        else {
            x.classList.toggle("answeredAnswer");
        }
    }
}
function WrapperToggleBackgroundColor(RootIdName, IsRevealOnly) {
    ToggleBackgroundColor(RootIdName, IsRevealOnly);
    ToggleBackgroundColor(RootIdName + "Points", IsRevealOnly);
}
function RevealAllAnswersAndPoints(){
    WrapperToggleBackgroundColor("Answer1", true);
    WrapperToggleBackgroundColor("Answer2", true);
    WrapperToggleBackgroundColor("Answer3", true);
    WrapperToggleBackgroundColor("Answer4", true);
    WrapperToggleBackgroundColor("Answer5", true);
    WrapperToggleBackgroundColor("Answer6", true);
    WrapperToggleBackgroundColor("Answer7", true);
    WrapperToggleBackgroundColor("Answer8", true);
    WrapperToggleBackgroundColor("Answer9", true);
    WrapperToggleBackgroundColor("Answer10", true);
}
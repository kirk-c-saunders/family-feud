Family Feud

Several years ago I created this really simple instance of a Family Feud game for doing fun little things at work or with friends when COVID first started. Since I am a database developer professionally it wasn't pretty and the implimentation was kind of clunky.

I thought it would be nice to "modernize" how this page works based on some of the things we are learning.

For this current deliverable for class I:
- moved all style details from inline CSS into an external CSS file
- moved all JavaScript into an external CSS file (and removed a JQuery reference since it doesn't seem to be needed)
- added some symantic HTML tags.

In the future I would like to:
- improve page's size responsiveness.
- Make the generation of the question and answer elements on screen dynamic from JSON/File/API call
- Add on some sort of "On Click" event on the various table rows so clicking in the row also reveals that row's answer.
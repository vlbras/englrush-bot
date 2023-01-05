const mainOptions = {
    "reply_markup": {
        "keyboard": [
            ["Start Quiz ▶", "Create Quiz ➕"],
            ["Delete Word 🗑", "Delete Folder 🗑"],
            ["Open Word"]
        ], "resize_keyboard": true
    }
}

let wordCommand = `<code>/add</code> word word ... - to add words`
let folderCommand ='<code>/folder</code> Name - to make a folder'

module.exports = {mainOptions, wordCommand, folderCommand}
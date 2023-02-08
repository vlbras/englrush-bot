const mainOptions = {
    "reply_markup": {
        "keyboard": [
            ["Start Quiz ▶", "Create Quiz ➕"],
            ["Delete Topic 🗑", "Delete Folder 🗑"],
            ["Delete Word 🗑","Open Word"]
        ], "resize_keyboard": true
    }
}

let wordCommand = `<code>/w</code> word - to add a word`
let topicCommand = `<code>/t</code> Name - to create a topic`
let folderCommand ='<code>/f</code> Name - to create a folder'

module.exports = {mainOptions, wordCommand, topicCommand, folderCommand}
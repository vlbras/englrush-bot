const mainOptions = {
    "reply_markup": {
        "keyboard": [
            ["Word Quiz ▶", "Description ▶", "Context ▶"],
            ["Create Quiz ➕", "Edit Quiz 📝","Statistics 📈"],
            ["Delete 🗂","Delete 📒", "Delete Word"]
        ], "resize_keyboard": true
    }
}

let wordCommand = `<code>/w</code> word - to add a word`
let topicCommand = `<code>/t</code> Name - to create a topic`
let folderCommand ='<code>/f</code> Name - to create a folder'

module.exports = {mainOptions, wordCommand, topicCommand, folderCommand}
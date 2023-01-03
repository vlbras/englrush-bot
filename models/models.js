const mongoose = require('mongoose')
const Schema = mongoose.Schema

const folderSchema = new Schema({
    name: {
        type: String,
        require: true
    },
    chatId: {
        type: String,
        require: true,
    }
})

const wordSchema = new Schema({
    name: {
        type: String,
        require: true
    },
    folderId: {
        type: String,
        require: true
    },
    chatId: {
        type: String,
        require: true,
    }
})

const Folder = mongoose.model('Folder', folderSchema)
const Word = mongoose.model('Word', wordSchema)

module.exports = {
    Folder,
    Word
}
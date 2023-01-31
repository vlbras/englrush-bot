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
    en: {
        type: String,
        require: true
    },
    ru: {
        type: String,
        require: true,
    },
    synonyms: {
        type: [String],
        require: true,
    },
    context: {
        type: [{
            en: String,
            ru: String
        }],
        require: true,
    },
    audio: {
        type: String,
        require: true,
    },
    folderId: {
        type: String,
        require: true
    },
    chatId: {
        type: String,
        require: true,
    },
})

const Folder = mongoose.model('Folder', folderSchema)
const Word = mongoose.model('Word', wordSchema)

module.exports = {
    Folder,
    Word
}
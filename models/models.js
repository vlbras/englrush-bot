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

const topicSchema = new Schema({
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

const wordSchema = new Schema({
    en: {
        type: String,
        require: true
    },
    ru: {
        type: String,
        require: true,
    },
    description: {
        type: String,
        require: true
    },
    context: [String]
    ,
    topicId: {
        type: String,
        require: true
    },
    chatId: {
        type: String,
        require: true,
    },
})

const Folder = mongoose.model('Folder', folderSchema)
const Topic = mongoose.model('Topic', topicSchema)
const Word = mongoose.model('Word', wordSchema)

module.exports = {
    Folder,
    Topic,
    Word
}
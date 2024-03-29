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
    uk: {
        type: String,
        require: true,
    },
    description: {
        type: String,
        require: true
    },
    context: [String]
    ,
    rating: {
        type: Number,
        default: 0,
        require: true
    },
    topicId: {
        type: String,
        require: true
    },
    chatId: {
        type: String,
        require: true,
    },
})

const dictionarySchema = new Schema({
    en: {
        type: String,
        require: true
    },
    uk: {
        type: String,
        require: true,
    },
    description: {
        type: String,
        require: true
    },
    context: [String]
})

const Folder = mongoose.model('Folder', folderSchema)
const Topic = mongoose.model('Topic', topicSchema)
const Word = mongoose.model('Word', wordSchema)
const Dictionary = mongoose.model('Dictionary', dictionarySchema)

module.exports = {
    Folder,
    Topic,
    Word,
    Dictionary
}
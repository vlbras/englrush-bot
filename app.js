const TelegramApi = require('node-telegram-bot-api')
const mongoose = require('mongoose')
require('dotenv').config()

const router = require('./routers/router')

const main = require('./controllers/mainController')
const folder = require('./controllers/folderController')
const word = require('./controllers/wordController')

const bot = new TelegramApi(process.env.TOKEN, { polling: true })

mongoose
    .set('strictQuery', false) // WTF
    .connect(process.env.MongoURL)
    .then(console.log("Connected to DB"))
    .catch(err => console.log('Failed to connect to MongoDB\n', err))

bot.on('message', msg => {

    router('/start', msg, main.start)
    router('Create Quiz ➕', msg, main.create)

    router('/mkfolder', msg, folder.make)
    router('Delete Folder 🗑', msg, folder.remove)

    router('/addwords', msg, word.add)
    router('Delete Word 🗑', msg, word.remove)
})

bot.on('callback_query', msg => {
    bot.answerCallbackQuery(msg.id)
    router('addwords', msg, word.add)
    router('rmfolder', msg, folder.remove)
    router('rmword', msg, word.remove)
})
const TelegramApi = require('node-telegram-bot-api')
const mongoose = require('mongoose')
const express = require('express')
require('dotenv').config()

const router = require('./routers/router')
const main = require('./controllers/mainController')
const folder = require('./controllers/folderController')
const topic = require('./controllers/topicController')
const word = require('./controllers/wordController')
const quiz = require('./controllers/quizController')

var cluster = require('cluster');
if (cluster.isMaster) {
    cluster.fork();
    cluster.on('exit', function () {
        cluster.fork();
        console.log('-----Gabella-----')
    });
}

if (cluster.isWorker) {

    const app = express()
    app.get('/', (req, res) => res.send('Hello World')).listen(process.env.PORT || 8000)

    mongoose
        .set('strictQuery', false) // WTF
        .connect(process.env.MongoURL)
        .then(console.log("Connected to DB"))
        .catch(err => console.log('Failed to connect to MongoDB\n', err))

    const bot = new TelegramApi(process.env.TOKEN, { polling: true })

    bot.on('message', msg => {
        router('/start', msg, main.start)
        router('Create Quiz ➕', msg, main.create)
        router('Edit Quiz 📝', msg, main.edit)

        router('/f', msg, folder.make)
        router('/rf', msg, folder.rename)
        router('Delete Folder 🗑', msg, folder.remove)

        router('/t', msg, topic.make)
        router('Delete Topic 🗑', msg, topic.remove)

        router('/w', msg, word.add)
        router('Delete Word 🗑', msg, word.remove)
        router('Open Word', msg, word.open)

        router('Start Quiz ▶', msg, quiz.start)
    })

    bot.on('callback_query', msg => {
        bot.answerCallbackQuery(msg.id)

        router('rmfolder', msg, folder.remove)
        router('quiz', msg, folder.quiz)

        router('mktopic', msg, topic.make)
        router('rmtopic', msg, topic.remove)

        router('addword', msg, word.add)
        router('openword', msg, word.open)
        router('rmword', msg, word.remove)

        router('word', msg, quiz.word)
        router('context', msg, quiz.context)
    })
}


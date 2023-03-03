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

const { Word } = require('./models/models')

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
    app.get('/', (req, res) => res.send('Hello World')).listen(process.env.PORT || 8000, () => console.log(`http://localhost:8000`))
    app.set('view engine', 'ejs')
    app.use(express.urlencoded({ extended: true })) // true for Arrays

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
        router('Delete 🗂', msg, folder.remove)

        router('/t', msg, topic.make)
        router('/rt', msg, topic.rename)
        router('Delete 📒', msg, topic.remove)

        router('/w', msg, word.add)
        router('Delete Word', msg, word.remove)
        router('Open Word', msg, word.open)

        router('Word Quiz ▶', msg, quiz.word)
        router('Description ▶', msg, quiz.description)
        // router('Context Quiz ▶', msg, quiz.context)
    })

    bot.on('callback_query', msg => {
        console.log(msg)
        bot.answerCallbackQuery(msg.id)

        router('rnfolder', msg, folder.rename)
        router('rmfolder', msg, folder.remove)

        router('mktopic', msg, topic.make)
        router('rntopic', msg, topic.rename)
        router('rmtopic', msg, topic.remove)

        router('addword', msg, word.add)
        router('openword', msg, word.open)
        router('rmword', msg, word.remove)

        router('quizword', msg, quiz.word)
        router('quizdesc', msg, quiz.description)
        // router('quizcontext', msg, quiz.context)
        router('+rating', msg, quiz.plusRating)
        router('-rating', msg, quiz.minusRating)
    })

    app.get('/:chatId', (req, res) => {
        const chatId = req.params.chatId
        res.render('index', { chatId })
    })

    app.post('/:chatId', (req, res) => {
        const chatId = req.params.chatId
        const w = req.query.w
        const { description, context } = req.body
        word.link(chatId, w, description, context)
        res.send(`Success`)
    })
}


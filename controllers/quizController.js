const TelegramApi = require('node-telegram-bot-api')
const bot = new TelegramApi(process.env.TOKEN)

const { Folder, Word } = require('../models/models')
const quizOptions = require('../options/quizOptions')

class QuizController {

    async start (chatId) {
        bot.sendMessage(chatId, `Select Quiz:`, quizOptions)
    }

    async word (chatId, _id) {
        let words = await Word.find({folderId: _id})
        let rand = Math.floor(Math.random() * (words.length))
        console.log(words[rand].en)
        bot.sendPoll(chatId,'Translate this word',['1', '2'], {type: 'quiz', correct_option_id: '1'})
    }

    async context (chatId, _id) {
        console.log(_id)    
    }
}

module.exports = new QuizController()
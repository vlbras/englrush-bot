const TelegramApi = require('node-telegram-bot-api')
const bot = new TelegramApi(process.env.TOKEN)

const { Topic, Word } = require('../models/models')
const topicOptions = require('../options/topicOptions')
const { wordCommand } = require('../options/mainOptions')

class QuizController {
    async word(chatId, n, _id) {
        if (!_id) return topicOptions(chatId, `quizword 0 &&`)

        if (!await Topic.findById(_id)) return bot.sendMessage(chatId, `❗️Please select a topic`)
        let words = await Word.find({ topicId: _id })
        if (!words.length) return bot.sendMessage(chatId, `❗️No word added.\n${wordCommand}`, { parse_mode: "HTML" })
        if (words.length < 5) return bot.sendMessage(chatId, `❗️Too few words. 5 is minimum`)

        n = Number(n)
        let i = words.length - 1 - n
        let last = i - 5
        for (i; i > last; i--) {
            if (!words[i]) return;
            let answers = [words[i].ru]
            while (answers.length != 5) {
                let rand = Math.floor(Math.random() * (words.length))
                if (!answers.includes(words[rand].ru)) answers.push(words[rand].ru)
                let temp = answers[rand % answers.length]
                answers[rand % answers.length] = answers[i % answers.length]
                answers[i % answers.length] = temp
            }
            await bot.sendPoll(chatId, `${words[i].en}`, [answers[0], answers[1], answers[2], answers[3], answers[4]], { type: 'quiz', correct_option_id: answers.indexOf(words[i].ru) })
            answers = []
        }
        if (words[i]) {
            return bot.sendMessage(chatId, `Would you like to continue?`, {
                reply_markup: JSON.stringify({
                    inline_keyboard: [[{ text: 'Next', callback_data: `quizword ${words.length - 1 - i} && ${_id}` }]]
                })
            })
        }
        return
    }

    async context(chatId, n, _id) {
        if (!_id) return topicOptions(chatId, `quizcontext 0 &&`)

        if (!await Topic.findById(_id)) return bot.sendMessage(chatId, `❗️Please select a topic`)
        let words = await Word.find({ topicId: _id })
        if (!words.length) return bot.sendMessage(chatId, `❗️No word added.\n${wordCommand}`, { parse_mode: "HTML" })
        if (words.length < 5) return bot.sendMessage(chatId, `❗️Too few words. 5 is minimum`)

        n = Number(n)
        let i = words.length - 1 - n
        let last = i - 5
        for (i; i > last; i--) {
            if (!words[i]) return;
            let answers = [words[i].en]
            while (answers.length != 5) {
                let rand = Math.floor(Math.random() * (words.length))
                if (!answers.includes(words[rand].en)) answers.push(words[rand].en)
                let temp = answers[rand % answers.length]
                answers[rand % answers.length] = answers[i % answers.length]
                answers[i % answers.length] = temp
            }
            await bot.sendPoll(chatId, `${words[i].context[0].en}`, [answers[0], answers[1], answers[2], answers[3], answers[4]], { type: 'quiz', correct_option_id: answers.indexOf(words[i].en) })
            answers = []
        }
        if (words[i]) {
            return bot.sendMessage(chatId, `Would you like to continue?`, {
                reply_markup: JSON.stringify({
                    inline_keyboard: [[{ text: 'Next', callback_data: `quizcontext ${words.length - 1 - i} && ${_id}` }]]
                })
            })
        }
        return
    }
}

module.exports = new QuizController()
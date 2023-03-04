const TelegramApi = require('node-telegram-bot-api')
const bot = new TelegramApi(process.env.TOKEN)

const { Topic, Word } = require('../models/models')
const topicOptions = require('../options/topicOptions')
const { wordCommand } = require('../options/mainOptions')

class QuizController {

    async word(chatId, _id) {
        if (!_id) return topicOptions(chatId, `quizword`)

        let questions = []
        let answers = []
        let words = await Word.find({ topicId: _id })
        let lovest = words[0].rating
        words.forEach(el => {
            if (el.rating < lovest) lovest = el.rating
        })
        words.forEach(el => {
            if (el.rating == lovest) {
                questions.push(el.en)
                answers.push(el.uk)
            }
        })
        for (let i = questions.length - 1; i >= 0; i--) {
            let text = `${questions.length - i}. ${questions[i]}`
            await bot.sendMessage(chatId, text + `\n\n<tg-spoiler>${answers[i]}</tg-spoiler>`, {
                reply_markup: JSON.stringify({
                    inline_keyboard:
                        [[{ text: `It's very easy 👍`, callback_data: `+rating ${text} && ${questions[i]}` },
                        { text: `It's not easy 👎`, callback_data: `-rating ${text} && ${questions[i]}` }]]
                }), parse_mode: "HTML"
            })
        }
        return
    }

    async description(chatId, _id) {
        if (!_id) return topicOptions(chatId, `quizdescription`)

        let questions = []
        let answers = []
        let words = await Word.find({ topicId: _id })
        let lovest = words[0].rating
        words.forEach(el => {
            if (el.rating < lovest) lovest = el.rating
        })
        words.forEach(el => {
            if (el.rating == lovest) {
                questions.push(el.description)
                answers.push(el.en)
            }
        })
        for (let i = questions.length - 1; i >= 0; i--) {
            await bot.sendMessage(chatId, `${questions.length - i}. ${questions[i]}\n\n<tg-spoiler>${answers[i]}</tg-spoiler>`, {
                reply_markup: JSON.stringify({
                    inline_keyboard:
                        [[{ text: `It's very easy 👍`, callback_data: `+rating ${questions.length - i}. ${answers[i]} && ${answers[i]}` },
                        { text: `It's not easy 👎`, callback_data: `-rating ${questions.length - i}. ${answers[i]} && ${answers[i]}` }]]
                }), parse_mode: "HTML"
            })
        }
        return
    }

    async context(chatId, _id) {
        if (!_id) return topicOptions(chatId, `quizcontext`)

        let questions = []
        let answers = []
        let words = await Word.find({ topicId: _id })
        let lovest = words[0].rating
        words.forEach(el => {
            if (el.rating < lovest) lovest = el.rating
        })
        words.forEach(el => {
            if (el.rating == lovest) {
                let rand = Math.floor(Math.random() * (el.context.length))
                questions.push(el.context[rand])
                answers.push(el.en)
            }
        })
        for (let i = questions.length - 1; i >= 0; i--) {
            let options = [answers[i]]
            while (options.length != 5) {
                let rand = Math.floor(Math.random() * (words.length))
                if (!options.includes(answers[rand])) options.push(answers[rand])
                let temp = options[rand % options.length]
                options[rand % options.length] = options[i % options.length]
                options[i % options.length] = temp
            }
            await bot.sendPoll(chatId, `${questions[i]}`, [options[0], options[1], options[2], options[3], options[4]], { type: 'quiz', correct_option_id: options.indexOf(answers[i]) })
            options = []
        }
        return
    }

    async plusRating(chatId, text, data) {
        let en = await data.split('&')[0]
        let messageId = await data.split('&')[1]
        let word = await Word.findOne({ en, chatId })
        await word.updateOne({ rating: word.rating + 1 })
        return bot.editMessageText(text + `\n\nIt's very easy 👍`, { chat_id: chatId, message_id: messageId })
    }

    async minusRating(chatId, text, data) {
        let messageId = await data.split('&')[1]
        return bot.editMessageText(text + `\n\nIt's not easy 👎`, { chat_id: chatId, message_id: messageId })
    }
}

let startQuiz = async (chatId, n, quizType, _id, words, anyQuestions, anyAnswers, option) => {
    if (!await Topic.findById(_id)) return bot.sendMessage(chatId, `❗️You should select an existing Topic`)
    if (!words.length) return bot.sendMessage(chatId, `❗️No word added.\n${wordCommand}`, { parse_mode: "HTML" })
    if (words.length < 5) return bot.sendMessage(chatId, `❗️Too few words. 5 is minimum`)

    n = Number(n)
    let i = words.length - 1 - n
    let last = i - 5
    for (i; i > last; i--) {
        if (!words[i]) return;
        let answers = [anyAnswers[i]] // anyAnswers[i]
        while (answers.length != 5) {
            let rand = Math.floor(Math.random() * (words.length))
            if (!answers.includes(anyAnswers[rand])) answers.push(anyAnswers[rand]) // anyAnswers[rand]
            let temp = answers[rand % answers.length]
            answers[rand % answers.length] = answers[i % answers.length]
            answers[i % answers.length] = temp
        }
        await bot.sendPoll(chatId, `${anyQuestions[i]}`, [answers[0], answers[1], answers[2], answers[3], answers[4]], { type: 'quiz', correct_option_id: answers.indexOf(anyAnswers[i]) })
        answers = []
    }
    return
}

module.exports = new QuizController()
const TelegramApi = require('node-telegram-bot-api')
const bot = new TelegramApi(process.env.TOKEN)

const { Topic, Word, Dictionary, Folder } = require('../models/models')
const topicOptions = require('../options/topicOptions')
const { wordCommand } = require('../options/mainOptions')

const words = require('./wordController')

class QuizController {

    async word(chatId, _id) {
        if (!_id) return topicOptions(chatId, `quizword`)

        let questions = []
        let answers = []
        let words = await Word.find({ topicId: _id })
        if (!words.length) return bot.sendMessage(chatId, "❗️No words added")
        
        let lovest = words[0].rating
        words.forEach(el => {
            if (el.rating < lovest) lovest = el.rating
        })
        words.forEach(async el => {
            if (el.rating == 6) {
                const { en, uk, description, context, topicId } = await Word.findOne({ en: el.en, chatId })
                await Word.findOneAndDelete({ en: el.en, chatId })
                if (!await Dictionary.findOne({ en })) {
                    let dict = new Dictionary({ en, uk, description, context })
                    await dict.save()
                }
                await Topic.findByIdAndDelete(topicId)
                return bot.sendMessage(`✅ Congrats! You know all words from this 📒 Topic, so I delete it`)
            }
            else if (el.rating == lovest) {
                questions.push(el.en)
                answers.push(el.uk)
            }
        })
        for (let i = questions.length - 1; i >= 0; i--) {
            let text = `${questions.length - i}. ${questions[i]}`
            await bot.sendMessage(chatId, text + `\n\n<tg-spoiler>${answers[i]}</tg-spoiler>`, {
                reply_markup: JSON.stringify({
                    inline_keyboard:
                        [[{ text: `It's very easy ✅`, callback_data: `+rating ${text} && ${questions[i]}` },
                        { text: `It's not easy ❌`, callback_data: `-rating ${text} && ${questions[i]}` }]]
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
        if (!words.length) return bot.sendMessage(chatId, "❗️No words added")

        let lovest = words[0].rating
        words.forEach(el => {
            if (el.rating < lovest) lovest = el.rating
        })
        words.forEach(async el => {
            if (el.rating == 6) {
                const { en, uk, description, context } = await Word.findOne({ en: el.en, chatId })
                await Word.findOneAndDelete({ en: el.en, chatId })
                if (!await Dictionary.findOne({ en })) {
                    let dict = new Dictionary({ en, uk, description, context })
                    return dict.save()
                }
            }
            else if (el.rating == lovest) {
                questions.push(el.description)
                answers.push(el.en)
            }
        })
        for (let i = questions.length - 1; i >= 0; i--) {
            await bot.sendMessage(chatId, `${questions.length - i}. ${questions[i]}\n\n<tg-spoiler>${answers[i]}</tg-spoiler>`, {
                reply_markup: JSON.stringify({
                    inline_keyboard:
                        [[{ text: `It's very easy ✅`, callback_data: `+rating ${questions.length - i}. ${answers[i]} && ${answers[i]}` },
                        { text: `It's not easy ❌`, callback_data: `-rating ${questions.length - i}. ${answers[i]} && ${answers[i]}` }]]
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
        if (!words.length) return bot.sendMessage(chatId, "❗️No words added")

        for await (const el of words) {
            let rand = Math.floor(Math.random() * (el.context.length))
            questions.push(el.context[rand])
            answers.push(el.en)
        }

        for await (const item of questions) {
            let i = questions.indexOf(item)
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
        return bot.editMessageText(text + `\n\nIt's very easy ✅`, { chat_id: chatId, message_id: messageId })
    }

    async minusRating(chatId, text, data) {
        let en = await data.split('&')[0]
        let messageId = await data.split('&')[1]
        let word = await Word.findOne({ en, chatId })
        await words.open(chatId, word._id)
        return bot.editMessageText(text + `\n\nIt's not easy ❌`, { chat_id: chatId, message_id: messageId })
    }
}

module.exports = new QuizController()
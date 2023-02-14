const TelegramApi = require('node-telegram-bot-api')
const bot = new TelegramApi(process.env.TOKEN)

const { Topic, Word } = require('../models/models')
const topicOptions = require('../options/topicOptions')
const { wordCommand } = require('../options/mainOptions')

class QuizController {
    async word(chatId, data, _id) {
        let option = `quizword`
        if (!_id) return topicOptions(chatId, `${option} 0 &&`)
        let n = data.split(' ')[0]
        let quizType = data.split(' ')[1]
        if (!quizType) return bot.sendMessage(chatId, `Select Quiz type:`, {
            reply_markup: JSON.stringify({
                inline_keyboard: [
                    [{ text: 'En-Ru', callback_data: `${option} 0 en && ${_id}` },
                    { text: 'Ru-En', callback_data: `${option} 0 ru && ${_id}` }]]
            })
        })

        let answers = []
        let questions = []
        let words = await Word.find({ topicId: _id })
        words.forEach(el => {
            if (quizType == 'en') {
                questions.push(el.en) // anyQuestions
                answers.push(el.ru) // anyAnswers
            } else {
                questions.push(el.ru) // anyQuestions
                answers.push(el.en) // anyAnswers
            }
        })
        return startQuiz(chatId, n, quizType, _id, words, questions, answers, option)
    }

    async context(chatId, data, _id) {
        let option = `quizcontext`
        if (!_id) return topicOptions(chatId, `${option} 0 &&`)
        let n = data.split(' ')[0]
        let quizType = data.split(' ')[1]
        let quizNumber = Number(data.split(' ')[2])
        if (!quizType) return bot.sendMessage(chatId, `Select Quiz type:`, {
            reply_markup: JSON.stringify({
                inline_keyboard:
                    [[{ text: `Context-Word ⬇️`, callback_data: ` ` }, { text: `Word-Context ⬇️`, callback_data: ` ` }],
                    [{ text: '1', callback_data: `${option} 0 context 0 && ${_id}` }, { text: '1', callback_data: `${option} 0 word 0 && ${_id}` }],
                    [{ text: '2', callback_data: `${option} 0 context 1 && ${_id}` }, { text: `2 (Doesn't work)`, callback_data: `-` }], // ${option} 0 word 1 && ${_id}
                    [{ text: '3', callback_data: `${option} 0 context 2 && ${_id}` }, { text: `2 (Doesn't work)`, callback_data: `-` }]], // ${option} 0 word 2 && ${_id}
            })
        })

        let answers = []
        let questions = []
        let words = await Word.find({ topicId: _id })
        for (let i = 0; i < words.length; i++) {
            if (quizType == 'context') {
                questions.push(words[i].context[quizNumber].en)
                answers.push(words[i].en)
            } else {
                questions.push(words[i].en)
                answers.push(words[i].context[quizNumber].en)
            }
        }
        quizType = quizType + ' ' + quizNumber
        return startQuiz(chatId, n, quizType, _id, words, questions, answers, option)
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
    if (words[i]) {
        return bot.sendMessage(chatId, `Would you like to continue?`, {
            reply_markup: JSON.stringify({
                inline_keyboard: [[{ text: 'Next', callback_data: `${option} ${words.length - 1 - i} ${quizType} && ${_id}` }]]
            })
        })
    }
    return
}

module.exports = new QuizController()
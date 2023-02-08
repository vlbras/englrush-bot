const TelegramApi = require('node-telegram-bot-api')
const bot = new TelegramApi(process.env.TOKEN)

const { Topic, Word } = require('../models/models')
const { wordCommand, topicCommand } = require('../options/mainOptions')

let array = []
let obj = {}

module.exports = wordOptions = async (chatId, option) => {

    const topics = await Topic.find({ chatId })
    const words = await Word.find({ chatId })

    if (!topics.length) return bot.sendMessage(chatId, `❗️No topic created.\n${topicCommand}`, { parse_mode: "HTML" })
    if (!words.length) return bot.sendMessage(chatId, `❗️No word added.\n${wordCommand}`, { parse_mode: "HTML" })

    for (let i = 0; i < topics.length; i++) {
        array[i] = []
        for (let j = 0; j < words.length; j++) {
            if (words[j].topicId == topics[i]._id) {
                obj.text = words[j].en
                obj.callback_data = option + ' ' + words[j]._id
                array[i][j] = obj
            }
            else {
                obj.text = "-"
                obj.callback_data = "-"
                array[i][j] = obj
                obj = {}
            }
            obj = {}
        }
        obj = {}
    }
    for (let k = 0; k < words.length * topics.length; k++) {
        for (let i = 0; i < array.length; i++) {
            for (let j = 0; j < array[0].length - 1; j++) {
                if (array[i][j].text == '-') {
                    [array[i][j], array[i][j + 1]] = [array[i][j + 1], array[i][j]]
                }
            }
        }
    }
    let count = 0
    let maxquiz = 0
    for (let i = 0; i < topics.length; i++) {
        for (let j = 0; j < words.length; j++) {
            if (topics[i]._id == words[j].topicId) {
                count++
            }
        }
        if (count > maxquiz) {
            maxquiz = count
        }
        count = 0
    }
    let matrix = []
    for (let i = 0; i < array.length; i++) {
        matrix[i] = []
        for (let j = 0; j < maxquiz; j++) {
            matrix[i][j] = array[i][j]
        }
    }
    let wordsKeyboard = []
    for (let i = 0; i < matrix[0].length + 1; i++) {
        wordsKeyboard[i] = []
        for (let j = 0; j < matrix.length; j++) {
            if (i == 0) {
                obj.text = '📒 ' + topics[j].name
                obj.callback_data = option + ' ' + topics[j]._id
                wordsKeyboard[i][j] = obj
                obj = {}
            }
            else {
                wordsKeyboard[i][j] = array[j][i - 1]
            }
        }
    }
    await bot.sendMessage(chatId, `Select Word:`, {
        reply_markup: JSON.stringify({
            inline_keyboard: wordsKeyboard
        })
    })
    return array = []
}

const TelegramApi = require('node-telegram-bot-api')
const bot = new TelegramApi(process.env.TOKEN)

const { Folder, Topic } = require('../models/models')
const { topicCommand, folderCommand } = require('../options/mainOptions')

let array = []
let obj = {}

module.exports = topicOptions = async (chatId, option) => {
    const folders = await Folder.find({ chatId })
    const topics = await Topic.find({ chatId })

    if (!folders.length) return bot.sendMessage(chatId, `❗️No folder created.\n${folderCommand}`, { parse_mode: "HTML" })
    if (!topics.length) return bot.sendMessage(chatId, `❗️No topic added.\n${topicCommand}`, { parse_mode: "HTML" })

    for (let i = 0; i < folders.length; i++) {
        array[i] = []
        for (let j = 0; j < topics.length; j++) {
            if (topics[j].folderId == folders[i]._id) {
                obj.text = topics[j].name
                obj.callback_data = option + ' ' + topics[j]._id
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
    for (let k = 0; k < topics.length * folders.length; k++) {
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
    for (let i = 0; i < folders.length; i++) {
        for (let j = 0; j < topics.length; j++) {
            if (folders[i]._id == topics[j].folderId) {
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
    let topicsKeyboard = []
    for (let i = 0; i < matrix[0].length + 1; i++) {
        topicsKeyboard[i] = []
        for (let j = 0; j < matrix.length; j++) {
            if (i == 0) {
                obj.text = '🗂 ' + folders[j].name
                obj.callback_data = option + ' ' + folders[j]._id
                topicsKeyboard[i][j] = obj
                obj = {}
            }
            else {
                topicsKeyboard[i][j] = array[j][i - 1]
            }
        }
    }
    await bot.sendMessage(chatId, `Select Topic:`, {
        reply_markup: JSON.stringify({
            inline_keyboard: topicsKeyboard
        })
    })
    return array = []
}

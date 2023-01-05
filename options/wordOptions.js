const TelegramApi = require('node-telegram-bot-api')
const bot = new TelegramApi(process.env.TOKEN)

const { Folder, Word } = require('../models/models')
const { wordCommand, folderCommand } = require('../options/mainOptions')

let array = []
let obj = {}

module.exports = wordOptions = async (chatId, option) => {
    const folders = await Folder.find({ chatId })
    const words = await Word.find({ chatId })
    if (folders.length) {
        if (words.length) {
            for (let i = 0; i < folders.length; i++) {
                array[i] = []
                for (let j = 0; j < words.length; j++) {
                    if (words[j].folderId == folders[i]._id) {
                        obj.text = words[j].name
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
            for (let k = 0; k < words.length * folders.length; k++) {
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
                for (let j = 0; j < words.length; j++) {
                    if (folders[i]._id == words[j].folderId) {
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
                        obj.text = '🗂 ' + folders[j].name
                        obj.callback_data = option + ' ' + folders[j]._id
                        wordsKeyboard[i][j] = obj
                        obj = {}
                    }
                    else {
                        wordsKeyboard[i][j] = array[j][i - 1]
                    }
                }
            }
            await bot.sendMessage(chatId, `Select Quiz:`, {
                reply_markup: JSON.stringify({
                    inline_keyboard: wordsKeyboard
                })
            })
            return array = []
        }
        return bot.sendMessage(chatId, `❗️No word added.\n${wordCommand}`, { parse_mode: "HTML" })
    }
    return bot.sendMessage(chatId, `❗️No folder created.\n${folderCommand}`, { parse_mode: "HTML" })
}

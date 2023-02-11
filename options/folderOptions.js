const TelegramApi = require('node-telegram-bot-api')
const bot = new TelegramApi(process.env.TOKEN)

const { Folder } = require('../models/models')
const { folderCommand } = require('../options/mainOptions')

let array = []
let obj = {}

module.exports = folderOptions = async (chatId, option) => {
    const folders = await Folder.find({ chatId })
    if (!folders.length) return bot.sendMessage(chatId, `❗️No folder created.\n${folderCommand}`, { parse_mode: "HTML" })

    folders.forEach(({ name, _id }) => {
        obj.text = '🗂 ' + name
        obj.callback_data = option + ' ' + _id
        array.push(obj)
        obj = {}
    })

    await bot.sendMessage(chatId, `Select Folder:`, {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                array
            ]
        })
    })
    return array = []
}
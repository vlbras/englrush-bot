const TelegramApi = require('node-telegram-bot-api')
const bot = new TelegramApi(process.env.TOKEN)

const { Folder } = require('../models/models')

let array = []
let obj = {}

let folderOptions = async (chatId, option, message) => {
    const folders = await Folder.find({ chatId })
    if (folders.length) {
        folders.forEach(({ name, _id }) => {
            obj.text = '🗂 ' + name
            obj.callback_data = option + ' ' + _id
            array.push(obj)
            obj = {}
        })
        await bot.sendMessage(chatId, message, {
            reply_markup: JSON.stringify({
                inline_keyboard: [
                    array
                ]
            })
        })
        return array = []
    }
    return bot.sendMessage(chatId, `❗️No folder created.\n<code>/mkfolder</code> Name - to make a folder`, { parse_mode: "HTML" })
}

module.exports = folderOptions
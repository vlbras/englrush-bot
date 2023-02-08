const TelegramApi = require('node-telegram-bot-api')
const bot = new TelegramApi(process.env.TOKEN)

const { mainOptions, wordCommand, topicCommand, folderCommand } = require('../options/mainOptions')

class MainController {
    async start(chatId) {
        return bot.sendSticker(chatId, "https://cdn.tlgrm.app/stickers/552/b31/552b31fc-5e93-4360-b2c2-9ee1e43a236e/192/5.webp", mainOptions)
    }
    async create(chatId) {
        return bot.sendMessage(chatId, `💬 Commands:\n${folderCommand}\n${topicCommand}\n${wordCommand}`, { parse_mode: "HTML" })
    }
}

const mainController = new MainController()

module.exports = mainController
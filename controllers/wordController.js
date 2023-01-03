const TelegramApi = require('node-telegram-bot-api')
const bot = new TelegramApi(process.env.TOKEN)

const { Word } = require('../models/models')
const folderOptions = require('../options/folderOptions')
const wordOptions = require('../options/wordOptions')

class WordController {

    async add(chatId, name, _id) {
        if (name) {
            if (!await Word.findOne({ name, chatId })) {
                if (_id) {
                    const word = new Word({ name, folderId: _id, chatId })
                    await word.save()
                    return bot.sendMessage(chatId, `✅ ${name} added`)
                }
                let option = 'addwords ' + name + " &&"
                return folderOptions(chatId, option, `Select Folder:`)
            }
            return bot.sendMessage(chatId, `❗️${name} already added`)
        }
        return bot.sendMessage(chatId, `❗️Name is ${name}`)
    }

    async remove(chatId, _id) {
        if (_id) {
            const word = await Word.findById(_id)
            if (word) {
                await word.delete()
                return bot.sendMessage(chatId, `✅ ${word.name} deleted`)
            }
            return bot.sendMessage(chatId, `❗️ You can't delete folder here`)
        }
        let option = 'rmword'
        return wordOptions(chatId, option)
    }
}

module.exports = new WordController()
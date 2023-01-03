const TelegramApi = require('node-telegram-bot-api')
const bot = new TelegramApi(process.env.TOKEN)

const { Folder, Word } = require('../models/models')
const folderOptions = require('../options/folderOptions')

class FolderController {

    async make(chatId, name) {
        if (name) {
            if (!await Folder.findOne({ name, chatId })) {
                const folder = new Folder({ name, chatId })
                await folder.save()
                return bot.sendMessage(chatId, `✅ 🗂 ${name} created`)
            }
            return bot.sendMessage(chatId, `❗️🗂 ${name} already created`)
        }
        return bot.sendMessage(chatId, `❗️Name is ${name}`)
    }

    async remove(chatId, _id) {
        if (_id) {
            const folder = await Folder.findById(_id)
            await folder.delete()
            await Word.deleteMany({ folderId: _id })
            return bot.sendMessage(chatId, `✅ 🗂 ${folder.name} deleted`)
        }
        let option = 'rmfolder'
        return folderOptions(chatId, option, `Select Folder:\n❗️All Words in 🗂 will also be deleted`)
    }
}

module.exports = new FolderController()
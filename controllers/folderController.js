const TelegramApi = require('node-telegram-bot-api')
const bot = new TelegramApi(process.env.TOKEN)

const { Folder, Word } = require('../models/models')
const folderOptions = require('../options/folderOptions')

class FolderController {

    async make(chatId, name) {
        if (name) {
            if (/^[a-zA-Z0-9 -]+$/.test(name)) {
                if (!await Folder.findOne({ name, chatId })) {
                    const folder = new Folder({ name, chatId })
                    await folder.save()
                    return bot.sendMessage(chatId, `✅ 🗂 ${name} created`)
                }
                return bot.sendMessage(chatId, `❗️🗂 ${name} already created`)
            }
            return bot.sendMessage(chatId, `❗️ You must only use letters and numbers in 🗂 name`)
        }
        return bot.sendMessage(chatId, `❗️Name is ${name}`)
    }

    async remove(chatId, _id) {
        if (!_id) {
            let option = 'rmfolder'
            return folderOptions(chatId, option)
        }
        if (await Folder.findById(_id)) {
            const folder = await Folder.findById(_id)
            await folder.delete()
            await Word.deleteMany({ folderId: _id })
            return bot.sendMessage(chatId, `✅ 🗂 ${folder.name} deleted`)
        }
        return
    }

    async quiz(chatId, option) {
        folderOptions(chatId, option, `Select Folder:`)
    }
}

module.exports = new FolderController()
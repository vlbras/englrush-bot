const TelegramApi = require('node-telegram-bot-api')
const bot = new TelegramApi(process.env.TOKEN)

const { Folder, Topic } = require('../models/models')
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
            await bot.sendMessage(chatId, `❗️All Topics from 🗂 will be deleted too`)
            return folderOptions(chatId, option)
        }
        if (await Folder.findById(_id)) {
            const folder = await Folder.findById(_id)
            await folder.delete()
            await Topic.deleteMany({ folderId: _id })
            return bot.sendMessage(chatId, `✅ 🗂 ${folder.name} deleted`)
        }
        return
    }
}

module.exports = new FolderController()
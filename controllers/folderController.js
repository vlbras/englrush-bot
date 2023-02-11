const TelegramApi = require('node-telegram-bot-api')
const bot = new TelegramApi(process.env.TOKEN)

const { Folder, Topic } = require('../models/models')
const folderOptions = require('../options/folderOptions')

class FolderController {

    async make(chatId, name) {
        if (!name) return bot.sendMessage(chatId, `❗️Name is ${name}`)
        if (!(/^[a-zA-Z0-9 -]+$/.test(name))) return bot.sendMessage(chatId, `❗️You must use only English letters and numbers in 🗂 name`)
        if (await Folder.findOne({ name, chatId })) return bot.sendMessage(chatId, `❗️🗂 ${name} already created`)

        const folder = new Folder({ name, chatId })
        await folder.save()
        return bot.sendMessage(chatId, `✅ 🗂 ${name} created`)
    }

    async rename(chatId, newName, _id) {
        if (!newName) return bot.sendMessage(chatId, `❗️Name is ${newName}`)
        if (!(/^[a-zA-Z0-9 -]+$/.test(newName))) return bot.sendMessage(chatId, `❗️You must use only English letters and numbers in 🗂 name`)
        if (await Folder.findOne({ name: newName, chatId })) return bot.sendMessage(chatId, `❗️🗂 ${newName} already created`)
        if (!_id) return folderOptions(chatId, `rnfolder ${newName} &&`)

        let folder = await Folder.findById(_id)
        await folder.updateOne({ name: newName })
        return bot.sendMessage(chatId, `✅ 🗂 ${folder.name} renamed to ${newName}`)
    }

    async remove(chatId, _id) {
        if (!_id)return folderOptions(chatId, 'rmfolder')
        
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
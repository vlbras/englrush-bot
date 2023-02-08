const TelegramApi = require('node-telegram-bot-api')
const bot = new TelegramApi(process.env.TOKEN)

const { Topic, Folder, Word } = require('../models/models')
const folderOptions = require('../options/folderOptions')
const topicOptions = require('../options/topicOptions')

class TopicController {

    async make(chatId, name, _id) {

        if (!name) return bot.sendMessage(chatId, `❗️Name is ${name}`)
        if (!(/^[a-zA-Z0-9 -]+$/.test(name))) return bot.sendMessage(chatId, `❗️ You must only use letters and numbers in 📒 name`)
        if (await Topic.findOne({ name, chatId })) return bot.sendMessage(chatId, `❗️📒  ${name} already created`)

        if (!_id) {
            let option = 'mktopic ' + name + " &&"
            return folderOptions(chatId, option, `Select Folder:`)
        }

        const topic = new Topic({ name, folderId: _id, chatId })
        await topic.save()
        return bot.sendMessage(chatId, `✅ 📒 ${name} created`)
    }

    async remove(chatId, _id) {

        if (!_id) {
            let option = 'rmtopic'
            return topicOptions(chatId, option)
        }

        const topic = await Topic.findById(_id)
        if (!topic) bot.sendMessage(chatId, `❗️You can't delete 🗂 here`)
        
        await topic.delete()
        return bot.sendMessage(chatId, `✅ ${topic.name} deleted`)
    }

    async quiz(chatId, option) {
        folderOptions(chatId, option, `Select Folder:`)
    }
}

module.exports = new TopicController()
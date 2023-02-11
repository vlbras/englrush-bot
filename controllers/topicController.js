const TelegramApi = require('node-telegram-bot-api')
const bot = new TelegramApi(process.env.TOKEN)

const { Topic, Word } = require('../models/models')
const folderOptions = require('../options/folderOptions')
const topicOptions = require('../options/topicOptions')

class TopicController {

    async make(chatId, name, _id) {
        if (!name) return bot.sendMessage(chatId, `❗️Name is ${name}`)
        if (!(/^[a-zA-Z0-9 -]+$/.test(name))) return bot.sendMessage(chatId, `❗️You must use only English letters and numbers in 📒 name`)
        if (await Topic.findOne({ name, chatId })) return bot.sendMessage(chatId, `❗️📒  ${name} already created`)

        if (!_id) return folderOptions(chatId, 'mktopic ' + name + " &&", `Select Folder:`)

        const topic = new Topic({ name, folderId: _id, chatId })
        await topic.save()
        return bot.sendMessage(chatId, `✅ 📒 ${name} created`)
    }

    async rename(chatId, newName, _id) {
        if (!newName) return bot.sendMessage(chatId, `❗️Name is ${newName}`)
        if (!(/^[a-zA-Z0-9 -]+$/.test(newName))) return bot.sendMessage(chatId, `❗️You must use only English letters and numbers in 📒 name`)
        if (await Topic.findOne({ name: newName, chatId })) return bot.sendMessage(chatId, `❗️📒 ${newName} already created`)
        if (!_id) return topicOptions(chatId, `rntopic ${newName} &&`)

        const topic = await Topic.findById(_id)
        if (!topic) return bot.sendMessage(chatId, `❗️You can't rename 🗂 here`)

        await topic.updateOne({ name: newName })
        return bot.sendMessage(chatId, `✅ 📒 ${topic.name} renamed to ${newName}`)
    }

    async remove(chatId, _id) {
        if (!_id) return topicOptions(chatId, 'rmtopic')

        const topic = await Topic.findById(_id)
        if (!topic) return bot.sendMessage(chatId, `❗️You can't delete 🗂 here`)

        await topic.delete()
        await Word.deleteMany({ topicId: _id })
        return bot.sendMessage(chatId, `✅ ${topic.name} deleted`)
    }
}

module.exports = new TopicController()
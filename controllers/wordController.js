const TelegramApi = require('node-telegram-bot-api')
const bot = new TelegramApi(process.env.TOKEN)

const { Word } = require('../models/models')
const folderOptions = require('../options/folderOptions')
const wordOptions = require('../options/wordOptions')

const wordParser = require('./wordParser')

class WordController {

    async add(chatId, name, _id) {
        if (name) {
            if (await validator(name)) {
                if (!await Word.findOne({ name, chatId })) {
                    if (_id) {
                        let { en, ru, context, correct } = await wordParser(name)
                        if (ru) {
                            await bot.sendMessage(chatId, `${en} - ${ru}\n\n💬 ${context[0].en}\n<i>❕${context[0].ru}</i>\n\n💬 ${context[1].en}\n<i>❕${context[1].ru}</i>\n\n💬 ${context[2].en}\n<i>❕${context[2].ru}</i>`, { parse_mode: "HTML" })
                            // const word = new Word({ name, ru, description, transcription, audio, folderId: _id, chatId })
                            // await word.save()
                            // await bot.sendMessage(chatId, `${name} - ${ru}\n${description}\n\n${transcription}`)
                            return bot.sendAudio(chatId, `https://englishlib.org/dictionary/audio/us/${en}.mp3`)
                        }
                        return bot.sendMessage(chatId, `You meant '${correct}'?`)
                    }
                    let option = 'add ' + name + " &&"
                    return folderOptions(chatId, option, `Select Folder:`)
                }
                return bot.sendMessage(chatId, `❗️${name} already added`)
            }
            return bot.sendMessage(chatId, `❗️ You must use only English letters in the name of the word`)
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

    async open(chatId, _id) {
        if (_id) {
            const { name, ru, description, transcription, audio } = await Word.findById(_id)
            return bot.sendMessage(chatId, `${name} - ${ru}\n${description}\n\n${transcription}`)
            return bot.sendAudio(chatId, audio)
        }
        let option = 'openword'
        return wordOptions(chatId, option)
    }
}

let validator = async (word) => {
    return /^[a-zA-Z]+$/.test(word)
}

module.exports = new WordController()
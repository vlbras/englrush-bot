const https = require('https')
const TelegramApi = require('node-telegram-bot-api')
const bot = new TelegramApi(process.env.TOKEN)

const { Word } = require('../models/models')
const folderOptions = require('../options/folderOptions')
const wordOptions = require('../options/wordOptions')

const wordParser = require('./wordParser')

class WordController {

    async add(chatId, name, _id) {
        // for name is undefined
        if (!name) {
            return bot.sendMessage(chatId, `❗️Name is ${name}`)
        }
        // for validation name
        if (!(/^[a-zA-Z]+$/).test(name)) {
            return bot.sendMessage(chatId, `❗️ You must use only English letters in the name of the word`)
        }
        // for not dublication words
        if (await Word.findOne({ en: name, chatId })) {
            return bot.sendMessage(chatId, `❗️${name} already added`)
        }
        // for folderOptions
        if (!_id) {
            let option = 'add ' + name + " &&"
            return folderOptions(chatId, option, `Select Folder:`)
        }
        // for check words
        let { en, ru, synonyms, context, correct } = await wordParser(name)
        if (!ru) {
            return bot.sendMessage(chatId, `You meant '${correct}'?`)
        }
        // for context handler
        for (let i = 0; i < context.length; i++) {
            for (let j = 0; j < 5; j++) {
                if (await context[i].en.includes(' ' + en + ',')) {
                    context[i].en = await context[i].en.replace(' ' + en + ',', ' ... ,')
                }
                else if (await context[i].en.includes(' ' + en + '.')) {
                    context[i].en = await context[i].en.replace(' ' + en + '.', ' ... .')
                }
                else if (await context[i].en.includes(' ' + en + ' ')) {
                    context[i].en = await context[i].en.replace(' ' + en + ' ', ' ...  ')
                }
            }
        }
        // for textHandler
        let temp = await textHandler(en, context, synonyms)
        context = temp.context
        let { contextStr, synonymsStr } = temp
        let audio
        // for augio getting
        https.get(`https://englishlib.org/dictionary/audio/us/${en}.mp3`, res => {
            console.log("USstatusCode = " + res.statusCode)
            if (res.statusCode === 200) {
                audio = `https://englishlib.org/dictionary/audio/us/${en}.mp3`
                return bot.sendAudio(chatId, `https://englishlib.org/dictionary/audio/us/${en}.mp3`)
            }
            https.get(`https://englishlib.org/dictionary/audio/uk/${en}.mp3`, res => {
                console.log("UKstatusCode = " + res.statusCode)
                if (res.statusCode === 200) {
                    audio = `https://englishlib.org/dictionary/audio/uk/${en}.mp3`
                    return bot.sendAudio(chatId, `https://englishlib.org/dictionary/audio/uk/${en}.mp3`)
                }
            })
            return bot.sendMessage(chatId, `😢 Sorry, I can't find audio`)
        })
        // for saving words
        const word = new Word({ en, ru, synonyms, context, audio, folderId: _id, chatId })
        await word.save()
        return bot.sendMessage(chatId, `${ucFirst(en)} - ${ru}\n\n${synonymsStr}${contextStr}`, { parse_mode: "HTML" })
    }

    async remove(chatId, _id) {
        // for wordOptions
        if (!_id) {
            let option = 'rmword'
            return wordOptions(chatId, option)
        }
        // for removing folder
        const word = await Word.findById(_id)
        if (!word) {
            return bot.sendMessage(chatId, `❗️ You can't delete folder here`)
        }
        // for removing words
        await word.delete()
        return bot.sendMessage(chatId, `✅ ${word.en} deleted`)
    }

    async open(chatId, _id) {
        // for wordOptions
        if (!_id) {
            let option = 'openword'
            return wordOptions(chatId, option)
        }
        // for opening words
        let { en, ru, synonyms, context, audio } = await Word.findById(_id)
        let temp = await textHandler(en, context, synonyms)
        let { contextStr, synonymsStr } = temp
        return bot.sendMessage(chatId, `${ucFirst(en)} - ${ru}\n\n${synonymsStr}${contextStr}`, { parse_mode: "HTML" })
        return bot.sendAudio(chatId, audio)
    }
}

let ucFirst = (str) => {
    return str[0].toUpperCase() + str.slice(1);
}

let textHandler = async (en, context, synonyms) => {
    let contextStr = ``
    let synonymsStr = ``
    // contextStr handler
    if (context.length) {
        for (let i = 0; i < context.length; i++) {
            if (!context[i]) {
                break
            }
            contextStr += `💬 ${context[i].en}\n<i>❕${context[i].ru}</i>\n\n`
        }
    }
    while (contextStr.includes(`... `)) {
        contextStr = contextStr.replace(`... `, `<b>` + en + `</b>`)
    }
    // synonymsStr handler
    if (synonyms.length) {
        for (let i = 0; context.length; i++) {
            if (!synonyms[i]) {
                synonymsStr = synonymsStr.substring(0, synonymsStr.length - 3)
                synonymsStr += `\n\n`
                break
            }
            synonymsStr += synonyms[i] + ` - `
        }
    }
    return {
        contextStr,
        synonymsStr
    }
}

module.exports = new WordController()
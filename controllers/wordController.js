const TelegramApi = require('node-telegram-bot-api')
const bot = new TelegramApi(process.env.TOKEN)

const { Word, Topic, Folder } = require('../models/models')
const folderOptions = require('../options/folderOptions')
const topicOptions = require('../options/topicOptions')
const wordOptions = require('../options/wordOptions')

const wordParser = require('./wordParser')

var dictionary = require('dictionary-en')
var nspell = require('nspell')
var gtts = require('node-gtts')('en');
var path = require('path');
var fs = require('fs')

process.env["NTBA_FIX_350"] = 1; //WTF

class WordController {

    async add(chatId, name, _id) {
        if (!name) return bot.sendMessage(chatId, `❗️Name is ${name}`)
        if (!(/^[a-zA-Z]+$/).test(name)) return bot.sendMessage(chatId, `❗️You must use only English letters in the name of the word`)
        if (await Word.findOne({ en: name, chatId })) return bot.sendMessage(chatId, `❗️${name} already added`)

        if (!_id) return topicOptions(chatId, 'addword ' + name + " &&")

        if (!await Topic.findById(_id)) return bot.sendMessage(chatId, `❗️You must select a Topic, not a 🗂`)

        return dictionary(async (err, dict) => {
            // Nspell cheking
            if (err) throw err
            let spell = nspell(dict)
            if (!spell.correct(name)) {
                console.log(spell.suggest(name))
                if (!Array.isArray(spell.suggest(name))) return bot.sendMessage(chatId, `You meant '${spell.suggest(name)}'?`)
                let arrayToText = ''
                spell.suggest(name).forEach(e => arrayToText += e + ', ')
                arrayToText = arrayToText.substring(0, arrayToText.length - 2)
                return bot.sendMessage(chatId, `You meant ${arrayToText}?`)
            }
            // Word parser
            let { en, ru, synonyms, context, correct } = await wordParser(name)
            if (!ru) {
                return bot.sendMessage(chatId, `You meant '${correct}'?`)
            }
            // for context handler
            for (let i = 0; i < context.length; i++) {
                for (let j = 0; j < 5; j++) {
                    if (await context[i].en.includes(' ' + en + ',')) {
                        context[i].en = await context[i].en.replace(' ' + en + ',', ' __ ,')
                    }
                    else if (await context[i].en.includes(' ' + en + '.')) {
                        context[i].en = await context[i].en.replace(' ' + en + '.', ' __ .')
                    }
                    else if (await context[i].en.includes('(' + en + ')')) {
                        context[i].en = await context[i].en.replace('(' + en + ')', '(__)')
                    }
                    else if (await context[i].en.includes(' ' + en + ' ')) {
                        context[i].en = await context[i].en.replace(' ' + en + ' ', ' __ ')
                    }
                }
            }
            // for textHandler
            let temp = await textHandler(en, context, synonyms)
            let { contextStr, synonymsStr } = temp
            let audio
            // for augio getting
            let filepath = path.join(__dirname, `${en}.mp3`);
            gtts.save(filepath, en, async () => {
                await bot.sendAudio(chatId, __dirname + `/${en}.mp3`, { performer: `EnglRush`, title: en })
                fs.unlink(__dirname + `/${en}.mp3`, err => {
                    if (err) console.log(err)
                })
            })
            // for saving words
            const word = new Word({ en, ru, synonyms, context, audio, topicId: _id, chatId })
            await word.save()
            return bot.sendMessage(chatId, `${ucFirst(en)} - ${ru}\n\n${synonymsStr}${contextStr}`, { parse_mode: "HTML" })
        })
    }

    async remove(chatId, _id) {
        if (!_id) return folderOptions(chatId, 'rmword')

        if (await Folder.findById(_id)) return wordOptions(chatId, 'rmword')

        const word = await Word.findById(_id)
        if (!word) return bot.sendMessage(chatId, `❗️You can't delete 📒 here`)

        await word.delete()
        return bot.sendMessage(chatId, `✅ ${word.en} deleted`)
    }

    async open(chatId, _id) {
        if (!_id) return wordOptions(chatId, 'openword')
        
        let { en, ru, synonyms, context} = await Word.findById(_id)
        let temp = await textHandler(en, context, synonyms)
        let { contextStr, synonymsStr } = temp
        return bot.sendMessage(chatId, `${ucFirst(en)} - ${ru}\n\n${synonymsStr}${contextStr}`, { parse_mode: "HTML" })
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
    while (contextStr.includes(`__`)) {
        contextStr = contextStr.replace(`__`, `<b>` + en + `</b>`)
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
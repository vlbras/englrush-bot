const TelegramApi = require('node-telegram-bot-api')
const bot = new TelegramApi(process.env.TOKEN)

const { Word, Topic, Folder } = require('../models/models')
const folderOptions = require('../options/folderOptions')
const topicOptions = require('../options/topicOptions')
const wordOptions = require('../options/wordOptions')

const translate = require('translate')
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
        name = await name.toLowerCase()
        if (await Word.findOne({ en: name, chatId })) return bot.sendMessage(chatId, `❗️${name} already added`)

        if (!_id) return topicOptions(chatId, 'addword ' + name + " &&")

        if (!await Topic.findById(_id)) return bot.sendMessage(chatId, `❗️You should select an existing Topic`)

        return dictionary(async (err, dict) => {
            // Nspell cheking
            if (err) throw err
            let spell = nspell(dict)
            if (!spell.correct(name)) {
                console.log(spell.suggest(name))
                if (!Array.isArray(spell.suggest(name))) return bot.sendMessage(chatId, `❗️You meant '${spell.suggest(name)}'?`)
                let arrayToText = ''
                spell.suggest(name).forEach(e => arrayToText += e + ', ')
                arrayToText = arrayToText.substring(0, arrayToText.length - 2)
                return bot.sendMessage(chatId, `❗️You meant ${arrayToText}?`)
            }
            // Word parser
            const data = {}
            data.en = name
            data.ru = await translate(name, "ru");
            // for context handler
            // for (let i = 0; i < context.length; i++) {
            //     for (let j = 0; j < 5; j++) {
            //         if (await context[i].en.includes(' ' + en + ',')) {
            //             context[i].en = await context[i].en.replace(' ' + en + ',', ' __ ,')
            //         }
            //         else if (await context[i].en.includes(' ' + en + '.')) {
            //             context[i].en = await context[i].en.replace(' ' + en + '.', ' __ .')
            //         }
            //         else if (await context[i].en.includes('(' + en + ')')) {
            //             context[i].en = await context[i].en.replace('(' + en + ')', '(__)')
            //         }
            //         else if (await context[i].en.includes(' ' + en + ' ')) {
            //             context[i].en = await context[i].en.replace(' ' + en + ' ', ' __ ')
            //         }
            //     }
            // }
            // for textHandler
            // let contextStr = await textHandler(en, context)
            // for augio getting
            let filepath = path.join(__dirname, `${data.en}.mp3`);
            gtts.save(filepath, data.en, async () => {
                await bot.sendAudio(chatId, __dirname + `/${data.en}.mp3`, { performer: `EnglRush`, title: data.en })
                fs.unlink(__dirname + `/${data.en}.mp3`, err => {
                    if (err) console.log(err)
                })
            })
            // for saving words
            const word = new Word({ en: data.en, ru: data.ru, topicId: _id, chatId })
            await word.save()
            return bot.sendMessage(chatId, `${ucFirst(data.en)} - ${data.ru}`) //\n\n${contextStr}`, { parse_mode: "HTML" }
        })
    }

    async remove(chatId, _id) {
        if (!_id) return folderOptions(chatId, 'rmword')

        if (await Folder.findById(_id)) return wordOptions(chatId, 'rmword ' + _id)

        const word = await Word.findById(_id)
        if (!word) return bot.sendMessage(chatId, `❗️You should select an existing word`)

        await word.delete()
        return bot.sendMessage(chatId, `✅ ${word.en} deleted`)
    }

    async open(chatId, _id) {
        if (!_id) return folderOptions(chatId, 'openword')

        if (await Folder.findById(_id)) return wordOptions(chatId, 'openword ' + _id)

        let { en, ru, context } = await Word.findById(_id)
        let contextStr = await textHandler(en, context)
        return bot.sendMessage(chatId, `${ucFirst(en)} - ${ru}\n\n${contextStr}`, { parse_mode: "HTML" })
    }
}

let ucFirst = (str) => {
    return str[0].toUpperCase() + str.slice(1);
}

let textHandler = async (en, context) => {
    let contextStr = ``
    if (context.length) {
        for (let i = 0; i < context.length; i++) {
            if (!context[i]) break
            contextStr += `💬 ${context[i].en}\n<i>❕${context[i].ru}</i>\n\n`
        }
    }
    while (contextStr.includes(`__`)) {
        contextStr = contextStr.replace(`__`, `<b>` + en + `</b>`)
    }
    return contextStr
}

module.exports = new WordController()
const translate = require('translate')
const Reverso = require('reverso-api')
const reverso = new Reverso()

module.exports = wordParser = async word => {
    word = await word.toLowerCase()
    let data = {}
    let check = await reverso.getSpellCheck(word, 'english', (err, response) => {
        if (err) throw new Error(err.message)
    })
    if (check.corrections[0].type != 'Punctuation') {
        data.correct = await check.text.toLowerCase()
    }
    else {
        let response = await reverso.getContext(word, 'english', 'russian', (err, response) => {
            if (err) throw new Error(err.message)
        })
        // console.log(response)
        data.en = await word.toLowerCase()
        data.ru = await translate(data.en, "ru");
        data.context = []
        // console.log(response.context)
        for (let i = 0; i < 3; i++) {
            if (!response.examples[i]) {
                break
            }
            data.context.push({
                en: response.examples[i].source,
                ru: response.examples[i].target
            })
        }
        let { synonyms } = await reverso.getSynonyms(word, 'english', (err, response) => {
            if (err) throw new Error(err.message)
        })
        // console.log(response.synonyms)
        data.synonyms = []
        for (let i = 0; i < 3; i++) {
            if (!synonyms[i]) {
                break
            }
            data.synonyms.push(synonyms[i].synonym)
        }
    }
    return data
}

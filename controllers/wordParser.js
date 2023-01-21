const Reverso = require('reverso-api')
const reverso = new Reverso()

module.exports = translate = async word => {
    let data = {}
    let check = await reverso.getSpellCheck(word, 'english', (err, response) => {
        if (err) throw new Error(err.message)
    })
    if (check.corrections[0].type != 'Punctuation') {
        data.correct = await check.text.toLowerCase()
    }
    else {
        let response = await reverso.getTranslation(word, 'english', 'russian', (err, response) => {
            if (err) throw new Error(err.message)
        })
        data.en = await word.toLowerCase()
        data.ru = response.translations[0]
        data.context = []
        for (let i = 0; i < 3; i++) {
            data.context.push({
                en: response.context.examples[i].source,
                ru: response.context.examples[i].target
            })
        }
    }

    return data
}
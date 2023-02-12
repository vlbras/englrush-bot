const translate = require('translate')
const Reverso = require('reverso-api')
const reverso = new Reverso()

module.exports = wordParser = async word => {
    word = await word.toLowerCase()
    let data = {}
    let response = await reverso.getContext(word, 'english', 'russian', (err) => {
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
    return data
}

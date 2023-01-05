const axios = require('axios')
const cheerio = require('cheerio')

module.exports = start = async (word) => {
    const url = `https://englishlib.org/dictionary/en-ru/${word}.html`
    const data = {}
    await axios.get(url)
        .then(res => {
            const page = res.data
            const $ = cheerio.load(page)
            data.ru = $('#block_tr > div > i').text()
            data.transcription = $('#us_tr_sound > span.transcription > big').text()
            data.audio = $('#audio_us > source').attr('src')
            $('#content-tab6 > b').remove()
            data.description = $('#content-tab6:first').text()
            data.description = data.description.substring(12, data.description.length - 6)
            console.log(data)
        })
    return data
}
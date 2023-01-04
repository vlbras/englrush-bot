const puppeteer = require('puppeteer')
const cheerio = require('cheerio')

module.exports = start = async (word) => {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    const url = `https://englishlib.org/dictionary/en-ru/${word}.html`

    await page.goto(url)
    const content = await page.content();
    const $ = cheerio.load(content);
    const data = {}
    data.ru = $('#block_tr > div > i').text()
    data.transcription = $('#us_tr_sound > span.transcription > big').text()
    data.audio = $('#audio_us > source').attr('src')
    $('#content-tab6 > b').remove()
    data.description = $('#content-tab6:first').text()
    data.description = data.description.substring(12, data.description.length - 6)
    console.log(data)
    await browser.close()
    return data
}
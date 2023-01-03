const { By, Key, Builder, until } = require('selenium-webdriver')
require('chromedriver')

module.exports = wordParse = async(word) =>{
    let data = {}
    let driver = await new Builder().forBrowser("chrome").build()
    let URL ='https://englishlib.org/dictionary/'
    await driver.get(URL)
    await driver.findElement(By.xpath('//*[@id="container"]/div[1]/div/div[1]/input')).sendKeys(word, Key.RETURN)
    await driver.findElement(By.xpath('//*[@id="container"]/div[1]/div/div[1]/i')).click()
    data.ru = await driver.findElement(By.xpath('//*[@id="block_tr"]/div/i')).getText()
    data.transcription = await driver.findElement(By.xpath('//*[@id="us_tr_sound"]/span[1]/big')).getText()
    data.audio = await driver.findElement(By.xpath('//*[@id="audio_us"]/source')).getAttribute('src')
    data.description = await driver.findElement(By.xpath('//*[@id="content-tab6"]')).getText()
    console.log(data)
    await driver.quit()
    return data
} 
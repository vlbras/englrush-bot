module.exports = router = async (option, msg, callback) => {
    let text, chatId
    if (msg.id) {
        text = msg.data
        chatId = msg.message.chat.id
    }
    else {
        text = msg.text
        chatId = msg.chat.id
        if (text === option) {
            return callback(chatId)
        }
    }
    if(!text) return
    const command = await text.split(' ')[0]
    let name = await text.replace(command + " ", "").split(' && ')[0]
    let _id = await text.replace(command + " ", "").split(' && ')[1]
    if ((command === '+rating') || (command === '-rating')) _id += '&' + msg.message.message_id
    if (command === option) return callback(chatId, name, _id)
}
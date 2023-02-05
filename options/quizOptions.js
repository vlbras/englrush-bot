
let array = []
let obj = {}

const quizOptions = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [
                {
                    text: 'Word',
                    callback_data: 'quiz word'
                },
                { // Beta
                    text: 'Synonyms',
                    callback_data: 'beta'
                },
                {
                    text: 'Context',
                    callback_data: 'quiz context'
                },
                
            ]
        ]
    })
}

module.exports = quizOptions
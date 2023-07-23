const { addMessage } = require('../services/dataBaseSqlite3');

class MessegesController {
  async add(chatId, socketId, messageId, text, time, type, read) {
    await addMessage(chatId, socketId, messageId, text, time, type, read);
    console.log('Сообщение добавлено в базу.');
  }
}

module.exports = new MessegesController();

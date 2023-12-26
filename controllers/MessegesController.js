const {
  getMesseges,
  addMessage,
 } = require('../services/dataBase');

class MessegesController {
  async get(){
    const messeges = await getMesseges();
    log(__filename, 'Получены сообщения пользователей');
    table(messeges);
    return messeges;
  }
  async add(chatId, socketId, id, text){
    await addMessage(chatId, socketId, id, text, new Date().getTime(), 'from', 0);
    log(__filename, 'Сообщение добавлено в базу');
  }
}

module.exports = new MessegesController();

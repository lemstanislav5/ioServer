const {
  getMesseges,
  addMessage,
  read,
 } = require('../services/dataBase');

class MessegesController {
  async get(){
    const messeges = await getMesseges();
    log(__filename, 'Получены сообщения пользователей');
    table(messeges);
    return messeges;
  }
  async add(chatId, socketId, messageId, text, type){
    await addMessage(chatId, socketId, messageId, text, new Date().getTime(), type, 0);
    log(__filename, 'Сообщение добавлено в базу', {chatId, socketId, messageId, text, type});
  }
  async read(currentUser){
    await read(currentUser);
    log(__filename, 'Прочитаны сообщения по чату: ', currentUser);
  }
}

module.exports = new MessegesController();

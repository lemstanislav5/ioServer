const {
  getMesseges,
 } = require('../services/dataBase');

class ManagerController {
  async get(){
    const messeges = await getMesseges();
    log(__filename, 'Получены сообщения пользователей');
    table(messeges);
  }
}

module.exports = new ManagerController();

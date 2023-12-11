const {
  getMesseges,
 } = require('../services/dataBase');

class ManagerController {
  async get(){
    const messeges = await getMesseges();
    log(__filename, 'Получены сообщения пользователей');
    table(messeges);
    return messeges;
  }
}

module.exports = new ManagerController();

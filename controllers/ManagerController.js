const {
  updateManagerSocketId,
  addManager,
  findManager,
  getManager,
 } = require('../services/dataBase');

class ManagerController {
  async get() {
    let manager = await getManager();
    log(__filename, 'Получены данные менеджера', manager);
    return manager[0];
  }

  async accest(id) {
    await updateManagerAccest(id);
    log(__filename, 'Получены доступ менеджера', id);
  }
  async add(id){
    await addManager(id);
    log(__filename, 'Менеджер добавлен', id);
  }
  async find(id){
    log(__filename, 'Поиск менеджера', id);
    return await findManager(id);
  }
  async updateSocketId(SocketId){
    log(__filename, 'Сокет менеджера обновлен на', SocketId);
    updateManagerSocketId(SocketId);
  }
}

module.exports = new ManagerController()

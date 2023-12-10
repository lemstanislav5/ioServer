const {
  updateManagerAccest,
  addManager,
  findManager,
  getManager,
  updateManager
 } = require('../services/dataBase');

class ManagerController {
  async get() {
    let manager = await getManager();
    log(__filename, 'Получены данные менеджера', manager);
    return manager[0];
  }

  async check(id) {
    let res = (await this.find(id))[0];
    if (res === undefined) return false;
    if (res.managerId === undefined || res.accest !== 1) return false;
    return true;
  }
  async accest(id) {
    await updateManagerAccest(id);
    log(__filename, 'Получены доступ менеджера', id);
  }
  async add(id){
    await addManager(id);
    log(__filename, 'Менеджер добавлен', id);
  }
  find(id){
    log(__filename, 'Поиск менеджера', id);
    return findManager(id);
  }
  update(){
    updateManager(socketId)
  }
}

module.exports = new ManagerController()

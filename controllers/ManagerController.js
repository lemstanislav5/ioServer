const {
  updateManagerAccest,
  addManager,
  findManager,
  getManager,
  getAdmin,
 } = require('../services/dataBase');

class ManagerController {
  async getAdmin() {
    let res = await getAdmin();
    console.log(__filename, '\n\x1b[33m Получены данные менеджера: \x1b[0m ', res);
    return res[0];
  }

  async check(id) {
    let res = (await this.find(id))[0];
    if (res === undefined) return false;
    if (res.managerId === undefined || res.accest !== 1) return false;
    return true;
  }
  async accest(id) {
    await updateManagerAccest(id);
    console.log('Доступ открыт!');
  }
  async add(id){
    await addManager(id);
    console.log('Менеджер добавлен!');
  }
  find(id){
    console.log('Получаем менеджера!');
    return findManager(id);
  }
  get(){
    console.log('Получаем менеджера!');
    return getManager();
  }
}

module.exports = new ManagerController()

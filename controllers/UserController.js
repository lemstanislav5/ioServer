const {
  addUser,
  findUser,
  updateSocketId,
  setCurrentUser,
  getCurrentUser,
  delCurrentUser,
  updateCurrentUser,
  userOnline,
  userOffline,
  findUserBySocketId,
} = require('../services/dataBaseSqlite3');



class UsersController {
  async addOrUpdateUser(socket, chatId) {
    const user = await findUser(chatId);
    if (user.length === 0) {
      await addUser(chatId, socket.id);
      console.log('Пользователь добавлен.');
    } else if (user.length > 0 && user[0].socketId !== socket.id) {
      console.warn('Сокет обновлен на: ' + socket.id);
      await updateSocketId(chatId, socket.id);
    } else {
      console.log('Сокет не нуждается в обновлении.');
    }
  }
  async setCurrent(chatId, required) {
    const users = await getCurrentUser();
    if(users.length === 0) {
      await setCurrentUser(chatId);
      console.log('Текущим пользователем выбран: ' + chatId);
    } else if(required === 1) {
      await updateCurrentUser(chatId);
      console.log('Текущим пользователем заменен на: ' + chatId);
    }
  }
  async delCurrent() {
    const chatId = await getCurrentUser().chatId;
    await delCurrentUser(chatId);
    console.log('Статус "текущий" у пользователя ' + chatId + ' удален в связи с разъединением связи!');
  }
  getCurrent() {
    console.log('Получаем текущего пользователя');
    return getCurrentUser();
  }
  async getSocketCurrentUser(chatId) {
    console.log('Получаем socketId текущего пользовтаеля!');
    const user = await findUser(chatId);
    if (user.length === 0) return false;
    return user[0].socketId;
  }
  async online(socketId){
    console.log('Сокет ' + socketId + ' online!');
    const user = await findUserBySocketId(socketId);
    userOnline(socketId);
  }
  async offline(socketId){
    console.log('Сокет ' + socketId + ' offline!');
    const user = await findUserBySocketId(socketId);
    userOffline(socketId);
  }
}

module.exports = new UsersController();

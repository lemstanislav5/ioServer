const {
  addUser,
  findUser,
  updateSocketId,
  updateCurrentUser,
  userOnline,
  userOffline,
  findUserBySocketId,
} = require('../services/dataBase');



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

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
  async checkСhatId(socket, chatId) {
    const user = await findUser(chatId);
    return (user.length === 0 ) ? false: true; 
  }

  async addUser(socket, chatId) {
    await addUser(chatId, socket.id);
    const user = await findUser(chatId);
    return (user.length === 0 ) ? false: true;
  }

  async checkSocket(socket, chatId) {
    const user = await findUser(chatId);
    return (user.length > 0 && user[0].socketId !== socket.id) ? false: true; 
  }

  async updateSocketId(socket, chatId) {
    await updateSocketId(chatId, socket.id);
    const user = await findUser(chatId);
    return (user.length > 0 && user[0].socketId !== socket.id) ? false: true; 
  }

  async getSocketCurrentUser(chatId) {
    console.log('Получаем socketId текущего пользовтаеля!');
    const user = await findUser(chatId);
    if (user.length === 0) return false;
    return user[0].socketId;
  }
  online(chatId){
    console.log('Сокет ' + chatId + ' online!');
    userOnline(chatId);
  }
  async offline(socketId){
    let user = await findUserBySocketId(socketId);
    userOffline(socketId);
    return user[0];
  }
}

module.exports = new UsersController();

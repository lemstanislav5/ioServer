const {
  addUser,
  findUser,
  updateSocketId,
  userOnline,
  userOffline,
  findUserBySocketId,
  getUsers
} = require('../services/dataBase');



class UsersController {
  async get(){
    let users = await getUsers();
    log(__filename, 'Получены данные пользователей');
    table(users);
    return users;
  }
  async checkСhatId(socket, chatId) {
    const user = await findUser(chatId);
    log(__filename, 'Проверка chatId пользователя', chatId);
    return (user.length === 0 ) ? false: true;
  }

  async addUser(socket, chatId) {
    await addUser(chatId, socket.id);
    const user = await findUser(chatId);
    log(__filename, 'Добавление chatId пользователя', chatId, socket.id);
    return (user.length === 0 ) ? false: true;
  }

  async checkSocket(socket, chatId) {
    const user = await findUser(chatId);
    log(__filename, 'Проверка socket.id пользователя', chatId, socket.id);
    return (user.length > 0 && user[0].socketId !== socket.id) ? false: true;
  }

  async updateSocketId(socket, chatId) {
    await updateSocketId(chatId, socket.id);
    const user = await findUser(chatId);
    log(__filename, 'Обновление socket.id пользователя', chatId, socket.id);
    return (user.length > 0 && user[0].socketId !== socket.id) ? false: true;
  }

  async online(chatId){
    log(__filename, 'Сокет online, chatId', chatId);
    await userOnline(chatId);
  }

  async offline(socketId){
    let user = await findUserBySocketId(socketId);
    userOffline(socketId);
    log(__filename, 'Сокет offline', user[0]);
    return user[0];
  }
}

module.exports = new UsersController();

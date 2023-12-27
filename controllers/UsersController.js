const {
  addUser,
  findUser,
  updateSocketId,
  userOnline,
  userOffline,
  findUserBySocketId,
  getUsers,
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
    const check = (user.length === 0 ) ? false: true;
    log(__filename, 'Проверка chatId пользователя', check);
    return check;
  }

  async addUser(socket, chatId) {
    await addUser(chatId, socket.id);
    const user = await findUser(chatId);
    log(__filename, 'Добавление chatId пользователя', chatId, socket.id);
    return (user.length === 0 ) ? false: true;
  }

  async checkSocket(socketId, chatId) {
    const user = await findUser(chatId);
    const check = (user.length > 0 && user[0].socketId !== socketId) ? false: true
    log(__filename, 'Проверка socket.id пользователя', check);
    return check;
  }

  async updateSocketId(socket, chatId) {
    await updateSocketId(chatId, socket.id);
    const user = await findUser(chatId);
    log(__filename, 'Обновление socket.id пользователя', chatId, socket.id);
    return (user.length > 0 && user[0].socketId !== socket.id) ? false: true;
  }
  async getUserSocketId(chatId) {
    const user = await findUser(chatId);
    log(__filename, 'Получен socket.id пользователя', user[0].socketId);
    return user[0].socketId;
  }
  async online(chatId){
    log(__filename, 'Сокет online, chatId', chatId);
    await userOnline(chatId);
  }
  async findBySocketId(socketId){
    let user = await findUserBySocketId(socketId);
    log(__filename, 'Поиск пользователя по сокету');
    table(user);
    return user[0];
  }
  async offline(chatId){
    await userOffline(chatId);
    log(__filename, 'Сокет offline', chatId);
  }
}

module.exports = new UsersController();

const fs = require("fs"),
      Utilities = require('../utilities/utilities'),
      process = require('process'),
      {userOnline} = require("../services/dataBase"),
      {v4: uuidv4} = require('uuid'),
      MessegesController = require("../controllers/MessegesController"),
      UsersController = require('../controllers/UsersController'),
      ManagerController = require('../controllers/AdminController'),
      { table } = require("console");


module.exports = {
  connection: async (socket) => {
    socket.join('users');
    const clients = io.sockets.adapter.rooms.get('users');
    log(__filename, 'Список клиентов комнаты: ', clients);
    //! ВОЗМОЖНОСТЬ ОБРАНВЛЕНИЯ СВЕДЕНИЙ О ПОЛЬЗОВАТЕЛЯХ ОНЛАЙН
    socket.on('online', async (chatId, callback) => {
      let checkСhatId, addUser, checkSocket, updateSocketId;
      checkСhatId = await UsersController.checkСhatId(socket, chatId);
      if (!checkСhatId) addUser = await UsersController.addUser(socket, chatId);
      checkSocket = await UsersController.checkSocket(socket.id, chatId);
      if (!checkSocket) updateSocketId = await UsersController.updateSocketId(socket, chatId);
      if(checkСhatId || addUser) {
        UsersController.online(chatId);
        let  {id, socketId} = await ManagerController.get();
        if (socketId === null) {
          log(__filename, 'МЕНЕДЖЕР НЕ ПОДКЛЮЧЕН К СОКЕТУ', socketId);
          return null; //! УВЕДОМЛЯЕМ, ЧТО СВЯЗЬ С МЕНЕДЖЕРОМ НЕ УСТАНОВЛЕНА
        }
        if(id && socketId) io.to(socketId).emit('online', chatId);
      }
      return callback({checkСhatId, addUser, checkSocket, updateSocketId});
    })
    //fromId, toId, socketId, messageId, text, time, type, read
    socket.on('newMessage', async ({fromId, text, time, type}, callback) => {
      const toId = 'admin', messegeId = uuidv4();
      await MessegesController.add(fromId, toId, messegeId, text, time, type);
      let message = await MessegesController.find(messegeId);
      const {socketId} = await ManagerController.get();
      if(socketId === undefined) callback({error: false})
      io.to(socketId).emit('newMessage', message[0]);
      log(__filename, 'Сообщение направлено администратору');
      table(message);
      return callback(message[0]);
    });

    socket.on('introduce', async ({chatId, name, email}, callback) => {
      const text = `Пользователь представился как: ${name} ${email}`;
      const toId = 'admin', messegeId = uuidv4(), fromId = chatId;
      await UsersController.introduce(name, email, fromId);
      await MessegesController.add(fromId, toId, messegeId, text, time = new Date().getTime(), type = 'text', read = 0);
      const message = await MessegesController.find(messegeId);
      const {socketId} = await ManagerController.get();
      if(socketId === undefined) callback(false)
      io.to(socketId).emit('newMessage', message[0]);
      io.to(socketId).emit('introduce', {fromId, name, email});
      log(__filename, 'Сообщение направлено администратору');
      table(message);
      return callback(message[0]);
    });
    socket.on('upload', async (file, {fromId, time, type}, callback) => {
      let dir = process.cwd() + '/media/' + type;
      await Utilities.checkDirectory(dir, fs);
      const fileName = new Date().getTime();
      const text = 'http://' + process.env.HOST + ':' + process.env.PORT + '/api/media/' + type + '/' + fileName + '.' + type;
      fs.writeFile(dir + '/' + fileName + '.' + type, file, async (err) => {
        const toId = 'admin', messegeId = uuidv4();
        await MessegesController.add(fromId, toId, messegeId, text, time, type);
        let message = await MessegesController.find(messegeId);
        const {socketId} = await ManagerController.get();
        console.log(socketId)
        if (err || socketId === null && socketId === undefined) return callback(false);
        io.to(socketId).emit('upload', message[0]);
        log(__filename, 'Файл отправлен администратору администратору', socketId);
        return callback(message[0]);
      })
    });
    socket.on('disconnect', async () => {
      const clients = io.sockets.adapter.rooms.get('users');
      log(__filename, 'Список клиентов комнаты: ', clients);
      //! ВОЗМОЖНОСТЬ ОБРАНВЛЕНИЯ СВЕДЕНИЙ О ПОЛЬЗОВАТЕЛЯХ ОНЛАЙН
      evant(__filename, 'D I S C O N N E C T');
      const user = await UsersController.findBySocketId(socket.id);
      if (user !== undefined) {
        const chatId = user.chatId;
        await UsersController.offline(socket.id);
        let  {id, socketId} = await ManagerController.get();
        if (socketId === null) {
          log(__filename, 'МЕНЕДЖЕР НЕ ПОДКЛЮЧЕН К СОКЕТУ', socketId);
          return null //! УВЕДОМЛЯЕМ, ЧТО СВЯЗЬ С МЕНЕДЖЕРОМ НЕ УСТАНОВЛЕНА
        }
        if (socketId && chatId) io.to(socketId).emit('offline', chatId);
        log(__filename, 'Пользователь отсоединился', 'статус offline');
      } else {
        log(__filename, 'Пользователь отсоединился', 'сокет в базе не найден, статус не изменен!!!');
      }
      // let data = await UsersController.offline(socket.id);
      // log(__filename, 'disconnect chatId', data);
      // if (data.chatId === undefined) return log(__filename, 'disconnect chatId', data);
      // let {id, socketId} = ManagerController.get();
      // if(id && socketId && chatId) io.to(socketId).emit('offline', chatId);
    });
  }
}

const fs = require("fs"),
      util = require('../utilities/utilities'),
      process = require('process'),
      { addMessage, findMesseges, userOnline } = require("../services/dataBase"),
      { v4: uuidv4 } = require('uuid');

const UsersController = require('../controllers/UsersController');
const ManagerController = require('../controllers/ManagerController');
const { table } = require("console");


module.exports = {
  connection: async (socket) => {
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
          return null //! УВЕДОМЛЯЕМ, ЧТО СВЯЗЬ С МЕНЕДЖЕРОМ НЕ УСТАНОВЛЕНА
        }
        if(id && socketId) io.to(socketId).emit('online', chatId);
      }
      return callback({checkСhatId, addUser, checkSocket, updateSocketId});
    })

    socket.on('newMessage', async (message, callback) => {
      const { id, text, chatId } = message;
      let error, answer;
      // Выполняется запись сообщения в базу данных!
      try {
        await addMessage(chatId, socket.id, id, text, new Date().getTime(), 'from', read = 0);
        error = false, answer = {add: true, send: false};
      } catch (err) {
        error = true, answer = {add: false, send: false};
        console.error(err);
        return callback(error, answer);
      }
      try {
        let recordedMessage = await findMesseges(id);
        const {socketId} = await ManagerController.get();
        if(socketId === undefined) return log(__filename, 'Manager socketId is undefined');
        io.to(socketId).emit('newMessage', recordedMessage[0]);
        log(__filename, 'Менеджеру передано следующее сообщение');
        table(recordedMessage[0])
      //io.to(socket.id).emit('notification', 'Менеджер offline!');
      // Опеределяем дефолтные настроки обратного уведомления  для callback
      // В зависимости от результата поиска добовляем или обновляем socketId
      } catch (err) {
        console.error(err);
        return callback(error, answer);
      }
      return callback(error, answer);
      /**
       * Пытаемся добавить сообщение в базу данных, если происходит ошибка отправляем
       * уведомление пользователю { add: false, send: false},
       * если сообщение успешно добавлено обновляем уведомление { add: true, send: false}
      */

    });
    //! УБРАТЬ
    socket.on('setNewSocket', (data) => {
      const { chatId } = data;
      UsersController.online(chatId)
    });
    socket.on('introduce', async (message, callback) => {
      const { name, email, chatId } = message;
      const text = `Пользователь представился как: ${name} ${email} ${chatId}`;
      // Опеределяем дефолтные настроки обратного уведомления для callback
      let notification = {add: false, send: false}
      /**
       * Пытаемся добавить "name" и "email" в базу данных, если происходит ошибка отправляем
       * уведомление пользователю { add: false, send: false},
       * если сообщение успешно добавлено обновляем уведомление { add: true, send: false}
      */
      try {
        UsersController.setNameAndEmail(name, email, chatId);
        MessegesController.add(chatId, socket.id, id, text, new Date().getTime(), 'from', read = 0);
        notification = {...notification, add: true};
        return callback(false, notification);
      } catch (err) {
        console.error(err);
        return callback(true, notification);
      }
    });
    socket.on("upload", async (file, type, callback) => {
      let section;
      if (type === 'jpeg' || type === 'jpg' || type === 'png') {
        section = 'images';
      } else if (type === 'pdf' || type === 'doc' || type === 'docx' || type === 'txt') {
        section =  'documents';
      } else if (type === 'mp3') {
        section = 'audio';
      } else if (type === 'mp4') {
        section = 'video';
      }
      let dir = process.cwd() + '/media/' + section;
      await util.checkDirectory(dir, fs);
      const fileName = new Date().getTime();
      const pathFile = 'http://' + process.env.HOST + '/api/media/' + section + '/' + fileName + '.' + type;
      fs.writeFile(dir + '/' + fileName + '.' + type, file, (err) => {
        if (!err) return callback({ url: pathFile });
        callback({url: false});
        console.log(err);
      })
    });
    socket.on('disconnect', async () => {
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

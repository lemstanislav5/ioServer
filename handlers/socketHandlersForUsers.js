const fs = require("fs");
const util = require('../utilities/utilities');
const process = require('process');
const { v4: uuidv4 } = require('uuid');

const UsersController = require('../controllers/UserController');
const MessegesController = require('../controllers/MessegesController');
const ManagerController = require('../controllers/ManagerController');


module.exports = {
  connection: async (socket) => {
    const currentSocketId = socket.id
    UsersController.online(socket.id);
    socket.on('newMessage', async (message, callback) => {
      const { id, text, chatId } = message;
      // Опеределяем дефолтные настроки обратного уведомления  для callback
      let notification = {add: false, send: false};
      // Устаналиваем chatId текущего пользователя если он не выбран
      UsersController.setCurrent(chatId);
      // В зависимости от результата поиска добовляем или обновляем socketId
      UsersController.addOrUpdateUser(socket, chatId);
      /** 
       * Пытаемся добавить сообщение в базу данных, если происходит ошибка отправляем 
       * уведомление пользователю { add: false, send: false}, 
       * если сообщение успешно добавлено обновляем уведомление { add: true, send: false} 
      */
      try {
        MessegesController.add(chatId, socket.id, id, text, new Date().getTime(), 'from', read = 0);
        notification = {...notification, add: true};
        return callback(false, notification);
      } catch (err) {
        console.error(err);
        return callback(true, notification);
      }
    });
    socket.on('setNewSocket', (data) => {
      const { chatId } = data;
      // Устаналиваем chatId текущего пользователя если он не выбран
      UsersController.setCurrent(chatId);
      // В зависимости от результата поиска добовляем или обновляем socketId
      UsersController.addOrUpdateUser(socket, chatId);
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
    socket.on('disconnect', () => {
      // UsersController.delCurrent();
      UsersController.offline(currentSocketId);
    });
  }
}
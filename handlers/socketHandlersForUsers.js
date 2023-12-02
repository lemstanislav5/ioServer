const fs = require("fs"),
      util = require('../utilities/utilities'),
      process = require('process'),
      { getAdmin, addMessage, findMesseges, userOnline } = require("../services/dataBase"), 
      { v4: uuidv4 } = require('uuid');

const UsersController = require('../controllers/UserController');


module.exports = {
  connection: async (socket) => {
    const currentSocketId = socket.id
    socket.on('online', async (chatId, callback) => {
      let resultOfChecking = null, resultAddUser = null, checkSocket = null, resultCheckSocket = null, resultUpdateSocketId = null;
      resultOfChecking = await UsersController.checkСhatId(socket, chatId);
      if (!resultOfChecking) resultAddUser = await UsersController.addUser(socket, chatId);
      resultCheckSocket = await UsersController.checkSocket(socket, chatId);
      if (!checkSocket) resultUpdateSocketId = await UsersController.updateSocketId(socket, chatId);
      console.log(JSON.stringify({resultOfChecking, resultAddUser, checkSocket, resultCheckSocket, resultUpdateSocketId}));
      return callback({resultOfChecking, resultAddUser, checkSocket, resultCheckSocket, resultUpdateSocketId});
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
        getAdmin()
        .then(admin => {
          if(admin[0] === 0 || admin[0].socketId === undefined) return console.log('getAdmin - ОШИБКА!')
          console.log('getAdmin: ', admin[0].socketId)
          io.to(admin[0].socketId).emit('newMessage', recordedMessage[0]);
          // 
        })
        .catch(err => console.log(err))
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
    socket.on('disconnect', () => {
      UsersController.offline(currentSocketId);
    });
  }
}
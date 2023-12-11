const jwt = require('jsonwebtoken'),
process = require('process'),
users = require("../utilities/users");
SECRET_KEY = process.env.PRIVATE_KEY;

const ManagerController = require('../controllers/ManagerController');
const MessegesController = require('../controllers/MessegesController');

module.exports = {
  authentication: (socket, next) => {
    if (socket.handshake.query && socket.handshake.query.token){
      jwt.verify(socket.handshake.query.token, SECRET_KEY, (err, decoded) => {
        if (err) return next(new Error('Authentication error'));
        socket.authentication = true;
        socket.decoded = decoded;
        console.log('Верификация токена, переданного через сокет пройдена успешно!: ', decoded);
        next();
      });
    } else if (socket.handshake.query && socket.handshake.query.token === undefined){
      socket.authentication = false;
      next();
    } else {
      next(new Error('Аутентификация провалина!'));
    }
  },
  connection: async (socket) => {
    log(__filename, 'М Е Н Е Д Ж Е Р   П О Д К Л Ю Ч И Л С Я');

    const { chatId } = data;
    // Устаналиваем chatId текущего пользователя если он не выбран
    UsersController.setCurrent(chatId);
    // В зависимости от результата поиска добовляем или обновляем socketId
    UsersController.addOrUpdateUser(socket, chatId);


    await ManagerController.updateSocketId(socket.id);

    socket.on('getUsers', async (callback) => {
      const users = await UsersController.get();
      callback(users);
    });

    socket.on('getMesseges', async (callback) => {
      const messeges = MessegesController.get();
      callback(messeges);
    });
    socket.on('newMessage', async (message, callback) => {
      log(__filename, 'Новое сообщение менеджера', message);
      // !const { id, text, chatId } = message;
      // Опеределяем дефолтные настроки обратного уведомления  для callback
      // !let notification = {add: false, send: false};
      // Устаналиваем chatId текущего пользователя если он не выбран
      // UsersController.setCurrent(chatId);
      // В зависимости от результата поиска добовляем или обновляем socketId
      // !UsersController.addOrUpdateUser(socket, chatId);
      /**
       * Пытаемся добавить сообщение в базу данных, если происходит ошибка отправляем
       * уведомление пользователю { add: false, send: false},
       * если сообщение успешно добавлено обновляем уведомление { add: true, send: false}
      */
      // !try {
      //   MessegesController.add(chatId, socket.id, id, text, new Date().getTime(), 'from', read = 0);
      //   notification = {...notification, add: true};
      //   return callback(false, notification);
      // } catch (err) {
      //   console.error(err);
      //   return callback(true, notification);
      // }
    });
    //! setNewSocket удрать, зделать по аналогии с проверкой актуальности сокета у пользователя
    // socket.on('setNewSocket', (data) => {
    //   const { chatId } = data;
    //   // Устаналиваем chatId текущего пользователя если он не выбран
    //   UsersController.setCurrent(chatId);
    //   // В зависимости от результата поиска добовляем или обновляем socketId
    //   UsersController.addOrUpdateUser(socket, chatId);
    // });
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
        log(__filename, 'fs.writeFile error', err);
      })
    });
    socket.on('disconnect', () => {
      log(__filename, 'disconnect', socket.id);
      // UsersController.delCurrent();
      //UsersController.offline(currentSocketId);
    });
  }
}

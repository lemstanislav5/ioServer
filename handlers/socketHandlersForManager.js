const jwt = require('jsonwebtoken'),
process = require('process'),
{v4: uuidv4} = require('uuid'),
users = require("../utilities/users");
SECRET_KEY = process.env.PRIVATE_KEY;

const ManagerController = require('../controllers/ManagerController');
const MessegesController = require('../controllers/MessegesController');
const UsersController = require('../controllers/UsersController');

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
    log(__filename, 'М Е Н Е Д Ж Е Р   П О Д К Л Ю Ч И Л С Я, socketId: ', socket.id);
    await ManagerController.updateSocketId(socket.id);

    socket.on('getUsers', async (callback) => {
      const users = await UsersController.get();
      log(__filename, 'Событие getUsers', users.length);
      callback(users);
    });

    socket.on('getMesseges', async (callback) => {
      const messeges = await MessegesController.get();
      log(__filename, 'Событие getMesseges', messeges.length);
      callback(messeges);
    });
    socket.on('read', async ({currentUser}, callback) => {
      const read = await MessegesController.read(currentUser);
      log(__filename, 'Событие read', currentUser);
      callback(currentUser);
    });
    //fromId, toId, socketId, messageId, text, time, type, read
    socket.on('newMessage', async ({toId, text, time, type}, callback) => {
      const fromId = 'admin', messegeId = uuidv4();
      log(__filename, 'Новое сообщение менеджера', {toId, text, time, type});
      await MessegesController.add(fromId, toId, messegeId, text, time, type);
      let message = await MessegesController.find(messegeId);
      const socketId = await UsersController.getUserSocketId(toId);
      io.to(socketId).emit('newMessage', message[0]);//!нужен ли callback на проверку доставки сообщения админу
      log(__filename, 'Сообщение направлено пользователю');
      table(message);
      return callback(message[0]);
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
      let dir = process.cwd() + '/media/' + type;
      await util.checkDirectory(dir, fs);
      const fileName = new Date().getTime();
      const pathFile = 'http://' + process.env.HOST + '/api/media/' + type + '/' + fileName + '.' + type;
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

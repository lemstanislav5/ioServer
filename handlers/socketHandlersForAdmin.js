const jwt = require('jsonwebtoken'),
fs = require("fs"),
Utilities = require('../utilities/utilities'),
process = require('process'),
{v4: uuidv4} = require('uuid'),
users = require("../utilities/users");
SECRET_KEY = process.env.PRIVATE_KEY;

const ManagerController = require('../controllers/AdminController');
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
    
    socket.on("upload", async (file, {toId, time, type}, callback) => {
      let dir = process.cwd() + '/media/' + type;
      await Utilities.checkDirectory(dir, fs);
      const fileName = new Date().getTime();
      const text = 'http://' + process.env.HOST + ':' + process.env.PORT + '/api/media/' + type + '/' + fileName + '.' + type;
      fs.writeFile(dir + '/' + fileName + '.' + type, file, async (err) => {
        const fromId = 'admin', messegeId = uuidv4();
        await MessegesController.add(fromId, toId, messegeId, text, time, type);
        let message = await MessegesController.find(messegeId);
        const socketId = await UsersController.getUserSocketId(toId);
        if (err) return callback(false);
        io.to(socketId).emit('newMessage', message[0]);
        log(__filename, 'Файл направлен пользователю');
        table(message);
        return callback(message[0]);
      })
    });
    socket.on('disconnect', () => {
      log(__filename, 'disconnect', socket.id);
      // UsersController.delCurrent();
      //UsersController.offline(currentSocketId);
    });
  }
}

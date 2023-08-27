/**
 * Основной принцип - избежать создания лишних сущностей (таблиц, объектов)
 * ?Нужно расмотреть вопрос о необходимости добавления в таблицу "users" полей phone и  email, либо создания отдельной таблицы?
*/
const sqlite3 = require('sqlite3').verbose();
const query = (file, req, sql, params = []) => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(file, (err) => {
            if (err) console.error(err.message);
        });
        db.serialize(() => db[req](sql, params,
            (err,res) => {
                if(err) return reject(err);
                resolve(res);
            }
        ));
        db.close((err) => {
            if (err) return console.error(err.message);
        });
    })
    .then((data) => (data))
    .catch((err) => {
      console.log(err);
    });
}

module.exports = {
    databaseInitialization: () => {
        return Promise.all([
            query('data.db3', 'run', "CREATE TABLE if not exists `users` (`id` INTEGER PRIMARY KEY AUTOINCREMENT,  `chatId` TEXT, `socketId` TEXT, `name` TEXT, `online` INTEGER)"),
            query('data.db3', 'run', "CREATE TABLE if not exists `messeges` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `chatId` TEXT,`socketId` TEXT, `messageId` TEXT, `text` TEXT, `time`  INTEGER, `type` TEXT, `read` INTEGER)"),
            query('data.db3', 'run', "CREATE TABLE if not exists `administrator` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `socketId` TEXT, `login` TEXT, `password` TEXT)"),
        ])
    },
    //users
    addUser: (chatId, socketId) => (query('data.db3', 'run', 'INSERT INTO users (chatId, socketId) values ("' + chatId + '","' + socketId + '")', [])),
    addMessage: (chatId, socketId, messageId, text, time, type, read) => (query('data.db3', 'run', 'INSERT INTO messeges (chatId, socketId, messageId, text, time, type, read) values ("' +
    chatId + '","' + socketId + '","' + messageId + '","' + text + '","' + time + '","' + type + '","' + read + '")', [])),
    findUser: (chatId) => (query('data.db3', 'all', 'SELECT * FROM users WHERE chatId = "' + chatId + '"', [])),
    updateSocketId: (chatId, socketId) => (query('data.db3', 'run', 'UPDATE users SET socketId=? WHERE chatId=?', [socketId, chatId])),
    getUsers: () => (query('data.db3', 'all', 'SELECT * FROM users', [])),
    //! Выбор число непрочитанных сообщений
    getMesseges: () => (query('data.db3', 'all', 'SELECT * FROM messeges', [])),
    updateCurrentUser: (chatId) => (query('data.db3', 'run', 'UPDATE currentUser SET chatId=?', [chatId])),
    userOnline: (socketId) => (query('data.db3', 'run', 'UPDATE users SET online=? WHERE socketId=?', [1, socketId])),
    userOffline: (socketId) => (query('data.db3', 'run', 'UPDATE users SET online=? WHERE socketId=?', [0, socketId])),
    findUserBySocketId: (socketId) => (query('data.db3', 'all', 'SELECT * FROM users WHERE socketId = "' + socketId + '"', [])),
    //Administrator
    addAdministrator: (login, password) => (query('data.db3', 'all', 'INSERT INTO administrator (login, password) values ("' + login + '","' + password + '")', [])),
    getAdministrator: () => (query('data.db3', 'all', 'SELECT * FROM administrator', [])),
}

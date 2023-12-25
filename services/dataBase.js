/**
 * Основной принцип - избежать создания лишних сущностей (таблиц, объектов)
 * ?Нужно расмотреть вопрос о необходимости добавления в таблицу "users" полей phone и  email, либо создания отдельной таблицы?
*/
const sqlite3 = require('sqlite3').verbose();
const query = (file, req, sql, params = []) => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(file, (err) => {
            if (err) return log(__filename, 'ОШИБКИ ПРИ ОТКРЫТИИ БАЗЫ ДАННЫХ', err);
        });
        db.serialize(() => db[req](sql, params,
            (err,res) => {
                if(err) return reject(err);
                resolve(res);
            }
        ));
        db.close(err => {
            if (err) return log(__filename, 'ОШИБКИ ПРИ ЗАКРЫТИИ БАЗЫ ДАННЫХ', err);
            log(__filename, 'БАЗА ДАННЫХ ЗАКРЫТА');
        });
    })
}

module.exports = {
    init: (login, password) => {
        return Promise.all([
            query('data.db3', 'run', "CREATE TABLE if not exists `users` (`id` INTEGER PRIMARY KEY AUTOINCREMENT,  `chatId` TEXT, `socketId` TEXT, `name` TEXT, `online` INTEGER)"),
            query('data.db3', 'run', "CREATE TABLE if not exists `messeges` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `chatId` TEXT,`socketId` TEXT, `messageId` TEXT, `text` TEXT, `time`  INTEGER, `type` TEXT, `read` INTEGER)"),
            query('data.db3', 'run', "CREATE TABLE if not exists `manager` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `socketId` TEXT, `login` TEXT, `password` TEXT)")
        ])
        .then(() => query('data.db3', 'all', 'INSERT OR REPLACE INTO manager (id, login, password) values ("1", "' + login + '","' + password + '")', []))
    },
    //-----------------------------------users-----------------------------------
    addUser: (chatId, socketId) => (query('data.db3', 'run', 'INSERT INTO users (chatId, socketId) values ("' + chatId + '","' + socketId + '")', [])),
    addMessage: (chatId, socketId, messageId, text, time, type, read) => (query('data.db3', 'run', 'INSERT INTO messeges (chatId, socketId, messageId, text, time, type, read) values ("' +
    chatId + '","' + socketId + '","' + messageId + '","' + text + '","' + time + '","' + type + '","' + read + '")', [])),
    findUser: (chatId) => (query('data.db3', 'all', 'SELECT * FROM users WHERE chatId = "' + chatId + '"', [])),
    updateSocketId: (chatId, socketId) => (query('data.db3', 'run', 'UPDATE users SET socketId=? WHERE chatId=?', [socketId, chatId])),
    getUsers: () => (query('data.db3', 'all', 'SELECT * FROM users', [])),
    findMesseges: (messageId) => (query('data.db3', 'all', 'SELECT * FROM messeges WHERE messageId = "' + messageId + '"', [])),
    getMesseges: () => (query('data.db3', 'all', 'SELECT * FROM messeges', [])),
    userOnline: (chatId) => (query('data.db3', 'run', 'UPDATE users SET online=? WHERE chatId=?', [1, chatId])),
    findUserBySocketId: (socketId) => (query('data.db3', 'all', 'SELECT * FROM users WHERE socketId = "' + socketId + '"', [])),
    userOffline: (socketId) => (query('data.db3', 'run', 'UPDATE users SET online=? WHERE socketId=?', [0, socketId])),
    read: (chatId) => (query('data.db3', 'run', 'UPDATE messeges SET read=? WHERE chatId=?', [1, chatId])),
    //-----------------------------------manager-----------------------------------
    getManager: () => (query('data.db3', 'all', 'SELECT * FROM manager', [])),
    updateManagerSocketId: (socketId) => (query('data.db3', 'all', 'UPDATE manager SET socketId=? WHERE id=1', [socketId])),

}

/**
 * Основной принцип - избежать создания лишних сущностей (таблиц, объектов)
 * ?Нужно расмотреть вопрос о необходимости добавления в таблицу "clients" полей phone и  email, либо создания отдельной таблицы?
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
            query('data.db3', 'run', "CREATE TABLE if not exists `clients` (`id` INTEGER PRIMARY KEY AUTOINCREMENT,  `chatId` TEXT, `socketId` TEXT, `name` TEXT, `online` INTEGER)"),
            query('data.db3', 'run', "CREATE TABLE if not exists `messeges` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `chatId` TEXT,`socketId` TEXT, `messageId` TEXT, `text` TEXT, `time`  INTEGER, `type` TEXT, `read` INTEGER)"),
            query('data.db3', 'run', "CREATE TABLE if not exists `manager` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `chatId` TEXT,`socketId` TEXT, `name` TEXT, `password` TEXT, `email` TEXT)"),
        ])
    },
    //clients
    addUser: (chatId, socketId) => (query('data.db3', 'run', 'INSERT INTO clients (chatId, socketId) values ("' + chatId + '","' + socketId + '")', [])),
    addMessage: (chatId, socketId, messageId, text, time, type, read) => (query('data.db3', 'run', 'INSERT INTO messeges (chatId, socketId, messageId, text, time, type, read) values ("' +
    chatId + '","' + socketId + '","' + messageId + '","' + text + '","' + time + '","' + type + '","' + read + '")', [])),
    findUser: (chatId) => (query('data.db3', 'all', 'SELECT * FROM clients WHERE chatId = "' + chatId + '"', [])),
    updateSocketId: (chatId, socketId) => (query('data.db3', 'run', 'UPDATE clients SET socketId=? WHERE chatId=?', [socketId, chatId])),
    getAllclients: () => (query('data.db3', 'all', 'SELECT * FROM clients', [])),
    //! Выбор число непрочитанных сообщений
    getMesseges: () => (query('data.db3', 'all', 'SELECT * FROM messeges', [])),
    updateCurrentUser: (chatId) => (query('data.db3', 'run', 'UPDATE currentUser SET chatId=?', [chatId])),
    userOnline: (socketId) => (query('data.db3', 'run', 'UPDATE clients SET online=? WHERE socketId=?', [1, socketId])),
    userOffline: (socketId) => (query('data.db3', 'run', 'UPDATE clients SET online=? WHERE socketId=?', [0, socketId])),
    findUserBySocketId: (socketId) => (query('data.db3', 'all', 'SELECT * FROM clients WHERE socketId = "' + socketId + '"', [])),
    //MANAGER
    addManager: () => (query('data.db3', 'all', 'INSERT INTO clients (chatId, socketId, name, password, email) values ("' + chatId + '","' + socketId + '")', [])),
    getManager: () => (query('data.db3', 'all', 'SELECT * FROM manager', [])),
}

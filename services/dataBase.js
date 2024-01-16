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
                if(err) {
                  log(__filename, 'ОШИБКА БАЗЫ ДАННЫХ', err);
                  return reject(err);
                }
                resolve(res);
            }
        ));
        db.close(err => {
            if (err) return log(__filename, 'ОШИБКИ ПРИ ЗАКРЫТИИ БАЗЫ ДАННЫХ', err);
        });
    })
}

module.exports = {
    init: () => {
        return Promise.all([
            //`conteiner: '#fff', top: '#2c2e33', messeges: '#000', from: '#303245', text: '#FFB700', notification: '#333', to: '#5e785e',
            query('data.db3', 'run', "CREATE TABLE if not exists `setingsSocketUser` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `url` TEXT, `ws` TEXT, `port` TEXT)"),
            query('data.db3', 'run', "CREATE TABLE if not exists `setingsConsentUser` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `consentLink` TEXT, `policyLink` TEXT)"),
            query('data.db3', 'run', "CREATE TABLE if not exists `setingsColorsUser` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `conteiner` TEXT, `top` TEXT, `messeges` TEXT, `fromId` TEXT, `text` TEXT, `notification` TEXT, `toId` TEXT)"),
            query('data.db3', 'run', "CREATE TABLE if not exists `setingsQuestionsUser` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `question` TEXT, offOn INTEGER)"),
            query('data.db3', 'run', "CREATE TABLE if not exists `setingsContactsUser` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `socialNetwork` TEXT, `link` TEXT, `offOn` INTEGER)"),
            query('data.db3', 'run', "CREATE TABLE if not exists `users` (`id` INTEGER PRIMARY KEY AUTOINCREMENT,  `chatId` TEXT, `socketId` TEXT, `name` TEXT, `email` TEXT, `online` INTEGER)"),
            query('data.db3', 'run', "CREATE TABLE if not exists `messeges` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `fromId` TEXT, `toId` TEXT, `messageId` TEXT, `text` TEXT, `time` INTEGER, `type` TEXT, `read` INTEGER)"),
            query('data.db3', 'run', "CREATE TABLE if not exists `admin` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `chatId` TEXT, `socketId` TEXT, `login` TEXT, `password` TEXT)")
        ])
        .then(() => query('data.db3', 'all', 'INSERT OR REPLACE INTO admin (id, chatId, login, password) values ("1", "admin", "1","1")', []))
        .then(() => query('data.db3', 'all', 'INSERT OR REPLACE INTO setingsSocketUser (id, url, ws, port) values ("1", "localhost", "ws", "4000")', []))
        .then(() => query('data.db3', 'all', 'INSERT OR REPLACE INTO setingsConsentUser (id, consentLink, policyLink) values ("1", "", "")', []))
        .then(() => query('data.db3', 'all', 'INSERT OR REPLACE INTO setingsColorsUser (id, conteiner, top, messeges, fromId, text, notification, toId) values ("1", "#fff", "#2c2e33", "#000", "#303245", "#FFB700", "#333", "#5e785e")', []))
        .then(() => query('data.db3', 'all', 'INSERT OR REPLACE INTO setingsQuestionsUser (id, question, offOn) values ("1", "Здравствуйте!", "1")', []))
        .then(() => query('data.db3', 'all', 'INSERT OR REPLACE INTO setingsContactsUser (id, socialNetwork, link, offOn) values ("1", "Telegram", "https://Telegram.com", "1")', []))
        .then(() => query('data.db3', 'all', 'INSERT OR REPLACE INTO setingsContactsUser (id, socialNetwork, link, offOn) values ("2", "VKontakte", "https://VKontakte.com", "1")', []))
        .then(() => query('data.db3', 'all', 'INSERT OR REPLACE INTO setingsContactsUser (id, socialNetwork, link, offOn) values ("3", "WhatsApp", "https://WhatsApp.com", "1")', []))
    },
    //-----------------------------------setings-----------------------------------
    getSetingsSocketUser: () => (query('data.db3', 'all', 'SELECT * FROM setingsSocketUser', [])),
    getSetingsConsentUser: () => (query('data.db3', 'all', 'SELECT * FROM setingsConsentUser', [])),
    getSetingsColorsUser: () => (query('data.db3', 'all', 'SELECT * FROM setingsColorsUser', [])),
    getSetingQuestionsUser: () => (query('data.db3', 'all', 'SELECT * FROM setingsQuestionsUser', [])),
    getSetingsContactsUser: () => (query('data.db3', 'all', 'SELECT * FROM setingsContactsUser', [])),

    setSetingsSocketUser: (data) => (query('data.db3', 'run', 'UPDATE setingsSocketUser SET url=?, ws=?, port=? WHERE id=1', [data.url, data.ws, data.port])),
    setSetingsConsentUser: (consent) => (query('data.db3', 'run', 'UPDATE setingsConsentUser SET policyLink=?, consentLink=? WHERE id=1', [consent.policyLink, consent.consentLink])),
    setSetingsColorsUser: (colors) => (query('data.db3', 'run', 'UPDATE setingsColorsUser SET conteiner=?, top=?, messeges=?, fromId=?, text=?, notification=?, toId=? WHERE id=1', [colors.conteiner, colors.top, colors.messeges, colors.fromId, colors.text, colors.notification, colors.toId])),
    delSetingQuestionsUser: () => (query('data.db3', 'run', 'DELETE FROM setingsQuestionsUser', [])),
    setSetingQuestionsUser: (data) => (query('data.db3', 'run', 'INSERT OR REPLACE INTO setingsQuestionsUser (id, question, offOn) values ("'+ data.id + '", "'+ data.question + '", "'+ data.offOn + '")', [])),
    delSetingContactsUser: () => (query('data.db3', 'run', 'DELETE FROM setingsContactsUser', [])),
    setSetingContactsUser: (data) => (query('data.db3', 'run', 'INSERT OR REPLACE INTO setingsContactsUser (id, socialNetwork, link, offOn) values ("'+ data.id + '", "'+ data.socialNetwork + '", "'+ data.link + '", "'+ data.offOn + '")', [])),
    //-----------------------------------users-----------------------------------
    addUser: (chatId, socketId) => (query('data.db3', 'run', 'INSERT INTO users (chatId, socketId) values ("' + chatId + '","' + socketId + '")', [])),
    findUser: (chatId) => (query('data.db3', 'all', 'SELECT * FROM users WHERE chatId = "' + chatId + '"', [])),
    updateSocketId: (chatId, socketId) => (query('data.db3', 'run', 'UPDATE users SET socketId=? WHERE chatId=?', [socketId, chatId])),
    getUsers: () => (query('data.db3', 'all', 'SELECT * FROM users', [])),
    introduce: (name, email, chatId) => (query('data.db3', 'run', 'UPDATE users SET name=?, email=? WHERE chatId=?', [name, email, chatId])),
    userOnline: (chatId) => (query('data.db3', 'run', 'UPDATE users SET online=? WHERE chatId=?', [1, chatId])),
    userOffline: (chatId) => (query('data.db3', 'run', 'UPDATE users SET online=? WHERE chatId=?', [0, chatId])),
    findUserBySocketId: (socketId) => (query('data.db3', 'all', 'SELECT * FROM users WHERE socketId = "' + socketId + '"', [])),
    //-----------------------------------messeges-----------------------------------
    //from, to, socketId, messageId, text, time, type, read
    addMessage: (fromId, toId, messageId, text, time, type, read) => (query('data.db3', 'run', 'INSERT INTO messeges (fromId, toId, messageId, text, time, type, read) values ("' +
      fromId + '","' + toId + '","' + messageId + '","' + text + '","' + time + '","' + type + '","' + read + '")', [])),
    findMessege: messageId => (query('data.db3', 'all', 'SELECT * FROM messeges WHERE messageId=?', [messageId])),
    getMesseges: () => (query('data.db3', 'all', 'SELECT * FROM messeges', [])),
    read: (chatId) => (query('data.db3', 'run', 'UPDATE messeges SET read=? WHERE fromId=? OR toId=?', [1, chatId])),
    //-----------------------------------admin-----------------------------------
    getAdmin: () => (query('data.db3', 'all', 'SELECT * FROM admin', [])),
    updateAdminSocketId: (socketId) => (query('data.db3', 'all', 'UPDATE admin SET socketId=? WHERE id=1', [socketId])),
}

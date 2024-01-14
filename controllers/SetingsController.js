const {
  getSetingsSocketUser,
  getSetingsConsentUser,
  getSetingsColorsUser,
  getSetingQuestionsUser,
  getSetingsContactsUser,
 } = require('../services/dataBase');

class SetingsController {
  async get(){
    const toArr = (obj) => {
      const arr = [];
        for (var key in obj[0]) {
          console.log(typeof obj[0][key], obj[0][key])
          if (obj[0].hasOwnProperty(key) && key !== 'id') arr.push([key, obj[0][key]]);
        }
      return arr;
    }
    // const setings = [
    //   ['socket', toArr(await getSetingsSocketUser())],
    //   ['consent', toArr(await getSetingsConsentUser())],
    //   ['colors', toArr(await getSetingsColorsUser())],
    //   ['questions', toArr(await getSetingQuestionsUser())],
    //   ['contact', toArr(await getSetingsContactUser())],
    // ]
    const setings = {
      socket: Object.assign({}, await getSetingsSocketUser()),
      consent: Object.assign({}, await getSetingsConsentUser()),
      colors: await getSetingsColorsUser(),
      questions: await getSetingQuestionsUser(),
      contacts: await getSetingsContactsUser(),
    }
    log(__filename, 'Настройки пользователя');
    table(await getSetingQuestionsUser());
    return setings;
  }
  //from, to, messageId, text, time, type, read
  async add(fromId, toId, messageId, text, time, type){
    const read = 0;
    const message = await addMessage(fromId, toId, messageId, text, time, type, read);
    log(__filename, 'Сообщение добавлено в базу');
    table(message);
  }
  async find(messageId){
    const message = await findMessege(messageId);
    log(__filename, 'Поиск сообщения', {message});
    return message;
  }
  async read(currentUser){
    await read(currentUser);
    log(__filename, 'Прочитаны сообщения по чату: ', currentUser);
  }
}

module.exports = new SetingsController();

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
          if (obj[0].hasOwnProperty(key) && key !== 'id') arr.push([key, obj[0][key]]);
        }
      return arr;
    }
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
  async set(data){
    log(__filename, 'Новые настройки сохранены в базе');
    //colors: colorsVal, socket: socketVal, consent: consentVal, questions: questionsVal, contacts: contactsVal
    table(data.colors);
    table(data.socket);
  }
}

module.exports = new SetingsController();

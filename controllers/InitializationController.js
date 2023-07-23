const { databaseInitialization } = require('../services/dataBaseSqlite3');

class InitializationController {
  async initialization() {
    await databaseInitialization();
    console.log('База данных создана.');
  }
}

module.exports = new InitializationController()
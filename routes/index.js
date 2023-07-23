let express = require('express')
  router = express.Router(),
  mediaRoutes = require('./mediaRoutes');

  router.get('/media*', mediaRoutes)
  /**
   * Также здесь можно разместить пути авторизации и выдачи другой информации
  */
  module.exports = router;
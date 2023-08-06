let express = require('express')
  router = express.Router(),
  mediaRoute = require('./mediaRoute'),
  httpHandlers = require('../handlers/httpHandlers'),
  path = require('path');

// проверка токена при любом http запросе
router.use((req, res, next) => httpHandlers.initiation(req, res, next));
router.use((req, res, next) => httpHandlers.authentication(req, res, next));
router.get('', (req, res) => res.sendFile('404.html', { root: path.join(__dirname, '../public') }));
router.post('/api/auth', (req, res) => httpHandlers.auth(req, res));
router.get('/api/refresh', (req, res) => httpHandlers.refresh(req, res));
router.post('/api/initiation', (req, res) => httpHandlers.initiation(req, res));
router.get('/api/media*', mediaRoute);
module.exports = router;
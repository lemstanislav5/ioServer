let express = require('express')
  router = express.Router(),
  mediaRoutes = require('./mediaRoute'),
  authRoutes = require('./authRoute'),
  httpHandlers = require('../handlers/httpHandlers');


app.get('/', (req, res) => res.sendFile('404.html', {root: __dirname }));
app.post('/api/auth', (req, res) => httpHandlers.auth(req, res));
app.get('/api/refresh', (req, res) => httpHandlers.refresh(req, res));
router.get('/api/media*', mediaRoute)
module.exports = router;
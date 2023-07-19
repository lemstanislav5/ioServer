const io = require('socket.io')();


module.exports = {
  connector: (req, res, next) => {
    console.log('connector req.auth', req.auth)
    // if(req.auth === false) {

    // }
    next();
  }
}
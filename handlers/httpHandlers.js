const jwt = require("jsonwebtoken"),
  process = require("process"),
  users = require("../users.json"),
  SECRET_KEY = process.env.PRIVATE_KEY;
const { get, update } = require('../controllers/ManagerController');

module.exports = {
  authentication: async (req, res, next) => {
    // Если инициализация пройдена и имеется заголовок авторизации
    let Manager = await get();
    if (Manager.length === 1) req.Manager = Manager[0];
    if (req.Manager && req.headers.authorization) {
      let token = req.headers.authorization.split(" ")[1];
      if (token === "undefined") return next();
      jwt.verify(token, SECRET_KEY, (err, payload) => {
        if (err) console.error("authentication: token is not verified");
        //? Проверка соответствия идентификатора
        if (
          req.Manager !== undefined &&
          payload !== undefined &&
          req.Manager.id === payload.id
        ) {
          req.auth = true;
        }
      });
    }
    next();
  },
  messages: (req, res) => {
    //! ДОРАБОТАТЬ
    if (req.auth) return res.status(200).send({ login: req.Manager.login });
    return res.status(401).send();
  },
  registration: async (req, res) => {
     //! ДОРАБОТАТЬ
    let result = await update(req.body.login, req.body.password);
    if (req.initiation === true) return res.send({ success: false });
    return res.send({ success: true });
  },
  authorization: (req, res) => {
    if (req.body.login === req.Manager.login && req.body.password === req.Manager.password) {
      // данные о пользователе
      const payload = { id: req.Manager.id, login: req.Manager.login };
      const accessToken = jwt.sign(payload, SECRET_KEY, { expiresIn: "14m" });
      const refreshToken = jwt.sign(payload, SECRET_KEY, { expiresIn: "30d" });
      const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        secure: true,
        sameSite: "none",
      };
      res.cookie("refreshToken", refreshToken, cookieOptions);
      return res.status(200).json({
        token: accessToken,
        login: req.Manager.login
      });
    }

    return res.status(404).json({ message: "User not found" });
  },
  refresh: (req, res) => {
    const inputRefreshToken = req.cookies.refreshToken;
    if (inputRefreshToken === undefined)
      return res
        .status(400)
        .json({ error: true, message: "refresh token is undefined" });
    jwt.verify(inputRefreshToken, SECRET_KEY, (err, tokenDetails) => {
      if (err)
        return res
          .status(400)
          .json({ error: true, message: "refresh token is not verified" });
      // данные о пользователе
      const payload = { id: tokenDetails.id, login: tokenDetails.login };
      const accessToken = jwt.sign(payload, SECRET_KEY, { expiresIn: "14m" });
      const refreshToken = jwt.sign(payload, SECRET_KEY, { expiresIn: "30d" });
      const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        secure: true,
        sameSite: "none",
      };
      res.cookie("refreshToken", refreshToken, cookieOptions);
      console.log('accessToken администратора обновлен по refreshToken.')
      return res.status(200).json({
        payload,
        token: accessToken,
      });
    });
  },
  logout: (req, res) => {
    //! ВОЗМОЖНО ОТРАЖАТЬ В БАЗЕ ВРЕМЯ И ДАТУ ВЫХОДА И ОБНОВЛЯТЬ СТАТУС
    const inputRefreshToken = req.cookies.refreshToken;
    if (inputRefreshToken === undefined)
      return res
        .status(400)
        .json({ error: true, message: "refresh token is undefined" });
    jwt.verify(inputRefreshToken, SECRET_KEY, (err, tokenDetails) => {
      if (err)
        return res
          .status(400)
          .json({ error: true, message: "refresh token is not verified" });
      // данные о пользователе
      const payload = { id: tokenDetails.id, login: tokenDetails.login };
      const accessToken = undefined;
      const refreshToken = undefined;
      const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        secure: true,
        sameSite: "none",
      };
      res.cookie("refreshToken", refreshToken, cookieOptions);
      console.log('logout: пользователь  id: ' + tokenDetails.id + 'login: ' +  tokenDetails.login + ' вышел из сервиса.' )
      return res.status(200).json({token: accessToken});
    });
  }
};

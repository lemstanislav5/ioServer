const jwt = require("jsonwebtoken"),
  process = require("process"),
  users = require("../users.json"),
  SECRET_KEY = process.env.PRIVATE_KEY;
const { getAdmin, updateAdmin } = require("../services/dataBase");

module.exports = {
  authentication: async (req, res, next) => {
    // Если инициализация пройдена и имеется заголовок авторизации
    let admin = await getAdmin();
    if (admin.length === 1) req.admin = admin[0];
    if (req.admin && req.headers.authorization) {
      let token = req.headers.authorization.split(" ")[1];
      if (token === "undefined") return next();
      jwt.verify(token, SECRET_KEY, (err, payload) => {
        if (err) console.error("TokenExpiredError: jwt expired");
        //? Проверка соответствия идентификатора
        if (
          req.admin !== undefined &&
          payload !== undefined &&
          req.admin.id === payload.id
        ) {
          req.auth = true;
        }
      });
    }
    next();
  },
  registration: async (req, res) => {
    let result = await updateAdmin(req.body.login, req.body.password);
    console.log(result);
    if (req.initiation === true) return res.send({ success: false });
    return res.send({ success: true });
  },
  authorization: (req, res) => {
    if (req.body.login === req.admin.login && req.body.password === req.admin.password) {
      // данные о пользователе
      const payload = { id: req.body.id, login: req.body.login };
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
        login: req.admin.login,
      });
    }

    return res.status(404).json({ message: "User not found" });
  },
  refresh: (req, res) => {
    console.log("req.cookies", req.cookies);
    // const refreshToken = req.cookies.jwt;
    let refreshToken = req.headers.authorization.split(" ")[1];
    if (refreshToken === undefined)
      return res
        .status(200)
        .json({ error: true, message: "Invalid refresh token " });
    jwt.verify(refreshToken, SECRET_KEY, (err, tokenDetails) => {
      console.log("tokenDetails", tokenDetails);
      if (err)
        return res
          .status(400)
          .json({ error: true, message: "Invalid refresh token 2" });
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
      return res.status(200).json({
        payload,
        token: accessToken,
      });
    });
  },
};

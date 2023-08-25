const jwt = require('jsonwebtoken'),
process = require('process'),
users = require('../users.json'),
SECRET_KEY = process.env.PRIVATE_KEY;
const { getManager, addManager } = require('../services/dataBaseSqlite3');


module.exports = {
    registration: async (req, res) => {
      let result  = await addManager(req.body.email, req.body.password);
      console.log(result);
      if (req.initiation === true) return res.send({success: false})
      return res.send({success: true})
    },
    authentication: async (req, res, next) => {
        //  Проверка на наличие существования менеджера
        let manager  = await getManager();
        if (manager.length === 0) req.initiation = false;
        if (manager.length === 1) req.initiation = true;
        if (req.headers.authorization) {
            let token = req.headers.authorization.split(' ')[1];
            if (token === 'undefined') return next()
            jwt.verify(token, SECRET_KEY, (err, payload) => {
                    if (err) console.error('TokenExpiredError: jwt expired');
                    //? Проверка соответствия идентификатора
                    if (manager[0] !== undefined && payload !== undefined && manager[0].id === payload.id) {
                        req.auth = true;
                        req.manager = payload.login;
                    }
                }
            );
        }
        next();
  },
  initiation:  (req, res) => (res.send({initiation: req.initiation, manager: req.manager})),
  auth: (req, res) => {
    for (let user of users) {
        if (
            req.body.login === user.login &&
            req.body.password === user.password
        ) {
            // данные о пользователе
            let { id, login } = users.find((item) => {
                if (item.login === req.body.login) return item;
            })
            const payload = {id, login};
            const accessToken = jwt.sign(
                payload,
                SECRET_KEY,
                { expiresIn: "14m" }
            );
            const refreshToken = jwt.sign(
                payload,
                SECRET_KEY,
                { expiresIn: "30d" }
            );
            const cookieOptions = {
                httpOnly: true,
                expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                secure: true,
                sameSite: 'none',
              };
            res.cookie("refreshToken", refreshToken, cookieOptions);
            return res.status(200).json({
                payload,
                token: accessToken,
            });
        }
    }

    return res
        .status(404)
        .json({ message: 'User not found' });
  },
  refresh: (req, res) => {
    console.log('req.cookies', req.cookies)
    // const refreshToken = req.cookies.jwt;
    let refreshToken = req.headers.authorization.split(' ')[1];
    if (refreshToken === undefined) return res.status(200).json({ error: true, message: "Invalid refresh token " });
    jwt.verify(refreshToken, SECRET_KEY, (err, tokenDetails) => {
        console.log('tokenDetails', tokenDetails)
        if (err) return res.status(400).json({ error: true, message: "Invalid refresh token 2" });
        // данные о пользователе
        const payload = { id: tokenDetails.id, login: tokenDetails.login };
        const accessToken = jwt.sign(
            payload,
            SECRET_KEY,
            { expiresIn: "14m" }
        );
        const refreshToken = jwt.sign(
            payload,
            SECRET_KEY,
            { expiresIn: "30d" }
        );
        const cookieOptions = {
            httpOnly: true,
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            secure: true,
            sameSite: 'none',
          };
        res.cookie("refreshToken", refreshToken, cookieOptions);
        return res.status(200).json({
            payload,
            token: accessToken,
        });
    });
  }

}

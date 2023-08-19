const jwt = require('jsonwebtoken'),
process = require('process'),
users = require('../users.json'),
SECRET_KEY = process.env.PRIVATE_KEY;
const { getManager } = require('../services/dataBaseSqlite3');


module.exports = {
    registration: () => {

    },
    authentication: async (req, res, next) => {
        //  Проверка на наличие существования менеджера
        let manager  = await getManager();
        if (manager.length === 0) req.manager = false;
        if (manager.length === 1) req.manager = true;
        if (req.headers.authorization) {
            let getToken = req.headers.authorization.split(' ')[1];
            if (getToken === 'undefined') return next()
            console.log(getToken)
            jwt.verify(
                getToken,
                SECRET_KEY,
                (err, payload) => {
                    if (err) {
                        console.log('err: ', err);
                        req.auth = false;
                    } else if (payload) {
                        //! ПРОВЕРКА ПО ДАННЫМ ИЗ БАЗЫ
                        console.log('payload: ', payload);
                        for (let user of users) {
                            if (user.id === payload.id) {
                                req.auth = true;
                                req.user = user;
                            }
                        }

                    }
                }
            );
        }
        console.log(req.auth)
        next();
  },
  initiation:  (req, res) => (res.send({manager: req.manager})),
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
    jwt.verify(refreshToken, SECRET_KEY, (err, tokenDetails) => {
        console.log('tokenDetails', tokenDetails)
        if (err) return res.status(400).json({ error: true, message: "Invalid refresh token" });
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

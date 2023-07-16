const express = require('express'),
    app = express(),
    jwt = require('jsonwebtoken'),
    users = require('./users');

const host = '127.0.0.1';
const port = 7000;
const cors = require('cors');
let cookieParser = require("cookie-parser");

//const privateKey = process.env.REFRESH_TOKEN_PRIVATE_KEY;
const privateKey = '1a2b-3c4d-5e6f-7g8h';
const corsOptions ={
    origin:'http://localhost:3000',
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json());
app.use((req, res, next) => {
    if (req.headers.authorization) {
        jwt.verify(
            req.headers.authorization.split(' ')[1],
            privateKey,
            (err, payload) => {
                if (err) next();
                else if (payload) {
                    for (let user of users) {
                        if (user.id === payload.id) {
                            req.user = user;
                            next();
                        }
                    }

                    if (!req.user) next();
                }
            }
        );
    }

    next();
});

app.post('/api/auth', (req, res) => {
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
            // const response = {
            //     "status": "Logged in",
            //     "token": token,
            //     "refreshToken": refreshToken,
            // }
            const accessToken = jwt.sign(
                payload,
                privateKey,
                { expiresIn: "14m" }
            );
            const refreshToken = jwt.sign(
                payload,
                privateKey,
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
});
app.get('/api/refresh', (req, res) => {
    console.log(req.cookies)
    // const refreshToken = req.cookies.jwt;
    let refreshToken = req.headers.authorization.split(' ')[1];
    jwt.verify(refreshToken, privateKey, (err, tokenDetails) => {
        console.log(tokenDetails)
        if (err) return res.status(400).json({ error: true, message: "Invalid refresh token" });
        // данные о пользователе
        const payload = { id: tokenDetails.id, login: tokenDetails.login };
        const accessToken = jwt.sign(
            payload,
            privateKey,
            { expiresIn: "14m" }
        );
        const refreshToken = jwt.sign(
            payload,
            privateKey,
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
});
app.get('/', (req, res) => {
  res.sendFile('404.html', {root: __dirname })
});

app.get('/user', (req, res) => {
    if (req.user) return res.status(200).json(req.user);
    else
        return res
            .status(401)
            .json({ message: 'Not authorized' });
});

app.listen(port, host, () => console.log(`Server listens http://${host}:${port}`));

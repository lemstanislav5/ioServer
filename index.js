require('dotenv').config();

const express = require('express'),
    app = express(),
    jwt = require('jsonwebtoken'),
<<<<<<< HEAD
    users = require('./users');
    http = require('http').Server(app),
    // socket----------------------------------------
    { Server } = require("socket.io");

    const io = new Server(4000, { 
        maxHttpBufferSize: 1e8, 
        pingTimeout: 60000, 
        cors: { origin: '*' }, 
    });

    io.on("connection", (socket) => {
        console.log('connection')
    });
    // socket----------------------------------------
=======
    users = require('./users'),
    host = '127.0.0.1',
    port = 7000,
    cors = require('cors'),
    cookieParser = require("cookie-parser"),
    process = require('process'),
    privateKey = process.env.PRIVATE_KEY;
>>>>>>> dec7287767c127713c8e3b027bb2b8d0fb42b2ca

const handlers = require('./handlers');

<<<<<<< HEAD

const connector = require('./handlers/socket')

//const SECRET_KEY = process.env.REFRESH_TOKEN_PRIVATE_KEY;
const SECRET_KEY = '1a2b-3c4d-5e6f-7g8h';
=======
>>>>>>> dec7287767c127713c8e3b027bb2b8d0fb42b2ca
const corsOptions ={
    origin:'http://localhost:3000',
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json());
<<<<<<< HEAD
app.use((req, res, next) => {
    console.log('req.headers.authorization')
    if (req.headers.authorization) {
        jwt.verify(
            req.headers.authorization.split(' ')[1],
            SECRET_KEY,
            (err, payload) => {
                if (err) {
                    req.auth = false;
                    next()
                } else if (payload) {
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
=======
app.use((req, res, next) => handlers.authorization(req, res, next, jwt, privateKey, users));
>>>>>>> dec7287767c127713c8e3b027bb2b8d0fb42b2ca

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
});
app.get('/api/refresh', (req, res) => {
    console.log(req.cookies)
    // const refreshToken = req.cookies.jwt;
    let refreshToken = req.headers.authorization.split(' ')[1];
    jwt.verify(refreshToken, SECRET_KEY, (err, tokenDetails) => {
        console.log(tokenDetails)
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

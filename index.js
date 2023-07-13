const express = require('express'),
    app = express(),
    jwt = require('jsonwebtoken'),
    users = require('./users');

const host = '127.0.0.1';
const port = 7000;
const cors = require('cors')

const tokenKey = '1a2b-3c4d-5e6f-7g8h';

const corsOptions ={
    origin:'http://localhost:3000', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}
app.use(cors(corsOptions));
app.use(express.json());
app.use((req, res, next) => {
    if (req.headers.authorization) {
        jwt.verify(
            req.headers.authorization.split(' ')[1],
            tokenKey,
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
            return res.status(200).json({
                id: user.id,
                login: user.login,
                token: jwt.sign({ id: user.id }, tokenKey),
            });
        }
    }

    return res
        .status(404)
        .json({ message: 'User not found' });
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
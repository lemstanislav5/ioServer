require('dotenv').config();

const express = require('express'),
    app = express(),
    cookieParser = require('cookie-parser'),
    process = require('process'),
    cors = require('cors'),
    HOST = process.env.HOST,
    PORT = process.env.PORT,
    SOCKET_PORT = process.env.SOCKET_PORT;

    http = require('http').Server(app),
    // socket----------------------------------------
    { Server } = require("socket.io"),
    handlers = require('./handlers'),

    io = new Server(SOCKET_PORT, { 
        maxHttpBufferSize: 1e8, 
        pingTimeout: 60000, 
        cors: { origin: '*' }, 
    });

    

    io.use((socket, next) => handlers.authentication(socket, next));
    io.on("connection", socket => handlers.connection(socket));
    // socket----------------------------------------


const corsOptions ={
    origin:'http://localhost:3000',
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
// проверка токена при любом  запросе
app.use((req, res, next) => handlers.authorization(req, res, next));
// проверка логина и пароля для получения токена
app.post('/api/auth', (req, res) => handlers.auth(req, res));
app.get('/api/refresh', (req, res) => handlers.refresh(req, res));
app.get('/', (req, res) => res.sendFile('404.html', {root: __dirname }));


app.listen(PORT, HOST, () => console.log(`Server listens http://${HOST}:${PORT}`));

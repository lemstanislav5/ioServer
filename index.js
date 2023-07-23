require('dotenv').config();

const express = require('express'),
    app = express(),
    cookieParser = require('cookie-parser'),
    process = require('process'),
    cors = require('cors'),
    HOST = process.env.HOST,
    PORT = process.env.PORT,
    SOCKET_PORT = process.env.SOCKET_PORT,
    InitializationController = require('./controllers/InitializationController');
    InitializationController.initialization();

    http = require('http').Server(app),
    // socket----------------------------------------
    { Server } = require("socket.io"),
    // обработчик для менеджера
    socketHandlersForManager = require('./handlers/socketHandlersForManager'),
    // обработчик для пользователя
    socketHandlersForUsers = require('./handlers/socketHandlersForUsers'),
    io = new Server(SOCKET_PORT, { 
        maxHttpBufferSize: 1e8, 
        pingTimeout: 60000, 
        cors: { origin: '*' }, 
    });
    io.use((socket, next) => socketHandlersForManager.authentication(socket, next));
    io.on("connection", socket => {
        if (socket.authentication === true) return socketHandlersForManager.connection(socket);
        else return socketHandlersForUsers.connection(socket)

    });
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
app.use((req, res, next) => httpHandlers.authorization(req, res, next));
// проверка логина и пароля для получения токена
app.use('/', routes);
// app.post('/api/auth', (req, res) => httpHandlers.auth(req, res));
// app.get('/api/refresh', (req, res) => httpHandlers.refresh(req, res));
// app.get('/', (req, res) => res.sendFile('404.html', {root: __dirname }));


app.listen(PORT, HOST, () => console.log(`Server listens http://${HOST}:${PORT}`));

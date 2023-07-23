require('dotenv').config();

const express = require('express'),
    app = express(),
    cookieParser = require('cookie-parser'),
    process = require('process'),
    cors = require('cors'),
    routes = require('./routes'),
    HOST = process.env.HOST,
    PORT = process.env.PORT,
    SOCKET_PORT = process.env.SOCKET_PORT,
    InitializationController = require('./controllers/InitializationController');
    InitializationController.initialization(),

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
io.on("connection", socket => (socket.authentication === true)
    ? socketHandlersForManager.connection(socket)
    : socketHandlersForUsers.connection(socket)
);
    // socket----------------------------------------

const corsOptions ={
    // хосты с которых разрешены запросы
    origin:['http://localhost:3001', 'http://localhost:3000'],
    credentials:true,            
    optionSuccessStatus:200
}
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use('/', routes);

app.listen(PORT, HOST, () => console.log(`Server listens http://${HOST}:${PORT}`));

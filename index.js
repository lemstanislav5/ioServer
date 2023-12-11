global.log = (filename, text, data) => {
  console.log('\x1b[36m%s\x1b[0m',filename);
  if (data === undefined) return console.log('\x1b[33m' + text + ': \x1b[0m ');
  console.log('\x1b[33m' + text + ': \x1b[0m ', data);
};
global.table = (data) => console.table(data);

require("dotenv").config();
// создаем базу данных и добавляем пользователя с паролем и логином - admin
require("./services/dataBase").init('1', '1')
const express = require("express"),
  app = express(),
  cookieParser = require("cookie-parser"),
  process = require("process"),
  cors = require("cors"),
  routes = require("./routes"),
  HOST = process.env.HOST,
  PORT = process.env.PORT,
  SOCKET_PORT = process.env.SOCKET_PORT;

(http = require("http").Server(app)),
  // socket----------------------------------------
  ({ Server } = require("socket.io")),
  // обработчик для менеджера
  (socketHandlersForManager = require("./handlers/socketHandlersForManager")),
  // обработчик для пользователя
  (socketHandlersForUsers = require("./handlers/socketHandlersForUsers")),
  (io = new Server(SOCKET_PORT, {
    maxHttpBufferSize: 1e8,
    pingTimeout: 60000,
    cors: { origin: "*" },
  }));
//socketHandlersForManager
io.use((socket, next) =>
  socketHandlersForManager.authentication(socket, next)
);
io.on("connection", (socket) =>
  socket.authentication === true
    ? socketHandlersForManager.connection(socket)
    : socketHandlersForUsers.connection(socket)
);
// socket----------------------------------------

const corsOptions = {
  // хосты с которых разрешены запросы
  origin: ["http://localhost:3001", "http://localhost:3000"],
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use("/", routes);

app.listen(PORT, HOST, () =>
  console.log(`Server listens http://${HOST}:${PORT}`)
);

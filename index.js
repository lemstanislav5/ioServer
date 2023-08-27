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
  (socketHandlersForAdministrator = require("./handlers/socketHandlersForAdmin")),
  // обработчик для пользователя
  (socketHandlersForUsers = require("./handlers/socketHandlersForUsers")),
  (io = new Server(SOCKET_PORT, {
    maxHttpBufferSize: 1e8,
    pingTimeout: 60000,
    cors: { origin: "*" },
  }));
//socketHandlersForAdministrator
io.use((socket, next) =>
  socketHandlersForAdministrator.authentication(socket, next)
);
io.on("connection", (socket) =>
  socket.authentication === true
    ? socketHandlersForAdministrator.connection(socket)
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

~const express = require 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const serverHttp = http.createServer(app);
const io = new Server(serverHttp);

io.on('connection', (socket) => {

  socket.on("join", ( name, number ) => {
    console.log(name, number);
  });

});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});

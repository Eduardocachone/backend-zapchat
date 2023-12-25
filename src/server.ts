import express from 'express';
import http from 'http';
import {Server} from 'socket.io';
import { v4 as uuidv4} from 'uuid';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = process.env.PORT || 4000;


const users:any = [];
const rooms:any = [];

function getUserDataByNumber(number:number) {
  return users.find((user:any) => user.number === number);
}

function getRoomDataById(roomId:string) {
  return rooms.find((room:any) => room.roomId === roomId);
}

function getUsersInRoom(roomId: string) {
  return users.filter((user: any) => user.currentRoom === roomId);
}


io.on("connection", (socket) => {

  socket.on("reloadPage",() =>{
    io.emit("allrooms", rooms);

  });

  socket.on("checkUserInRoom", (myNumber:number) => {
  const myUser = getUserDataByNumber(myNumber);

  if (myUser && myUser.currentRoom) { 
    socket.emit("userInRoomStatus", true);
  } else {
    socket.emit("userInRoomStatus", false);
  }
});

  socket.on("register", (name: string, number:number) => {
    const user = {
      userId: socket.id,
      name: name,
      number: number,
    }
    users.push(user);


    console.log(users);
  });


  socket.on("createRoom", (roomName:string, myNumber:number) =>{
    const myUser = getUserDataByNumber(myNumber);
    const roomId = uuidv4();
    const roomCreator = myUser.name;

    const room = {
      roomId: roomId,
      roomName: roomName,
      roomCreator: roomCreator
    };
    rooms.push(room);

    io.emit("allrooms", rooms);
    console.log(rooms);
  });



  socket.on("joinRoom", (selectRoomId: string, myNumber:number) => {
    const selectRoom = getRoomDataById(selectRoomId);
    const myUser = getUserDataByNumber(myNumber);
  
    if (myUser.currentRoom) {
      socket.leave(`room${myUser.currentRoom}`);
      myUser.currentRoom = selectRoomId;
    } else {
      myUser.currentRoom = selectRoomId;
    }
  
    socket.join(`room${selectRoomId}`);
  
    if (!selectRoom.messages) {
      selectRoom.messages = [];
    }
    io.to(`room${selectRoomId}`).emit("usersInRoom", getUsersInRoom(selectRoomId));

    const message = `${myUser.name} entrou na sala`;
    io.to(`room${selectRoomId}`).emit("userJoinedInRoom", message);
    
  });
  
  socket.on("message", (message: string, selectRoomId: string, myNumber: number) => {
    const selectRoom = getRoomDataById(selectRoomId);
    const myUser = getUserDataByNumber(myNumber);
  
    const userName = myUser.name;
    const userNumber = myUser.number
    const date = new Date();

    const horaMinuto = `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  
    const userMessage = {
      userName,
      userNumber,
      date: horaMinuto,
      message,
    };
    console.log(userMessage)
    selectRoom.messages.push(userMessage);
  
    io.to(`room${selectRoomId}`).emit("message", userMessage);


  });


  socket.on("getAllMessages", (selectRoomId: string) => {
    const selectRoom = getRoomDataById(selectRoomId);
    const messages = selectRoom.messages || [];
  
    io.to(`room${selectRoomId}`).emit("allMessages", messages);
   
  });
});



server.listen(port, () =>{
  console.log(`server running port ${port}`)
})
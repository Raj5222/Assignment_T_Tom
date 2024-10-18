import { Server } from "socket.io";
import { createServer } from "http";

let instance;

function ChatRoom() {
  if (instance) return instance;

  try {
    const server = createServer();
    const io = new Server(server, {
      path: "/api/Chat/",
      cors: {
        origin: "*",
      },
      transports: ["websocket"],
    });
    const port = process.env.Socket_Port;
    if (!port) console.warn("Port Not Avalable In Socket File.");

    server.listen(port, () => {
      //Socket Port
      console.log(`Socket.IO Server Start On Port ${port}`);
    });

    const users = {};

    io.on("connection", (socket) => {
      console.log("Socket is connected.");

      // join a chat
      socket.on("joinRoom", ({ username, room }) => {
        socket.join(room);
        users[socket.id] = { username, room };
        console.log(`${username} Joined Room : ${room}`);
        socket.to(room).emit("chat", {
          message: `${username} Joined Room`,
          system: true,
        });
      });

      // chat events
      socket.on("Group", (payload) => {
        const { room } = users[socket.id];
        if (room) {
          console.log("New Message in room:", room, payload);
          io.to(room).emit("chat", payload);
        }
      });

      // user disconnect
      socket.on("disconnect", () => {
        const user = users[socket.id];
        if (user) {
          console.log(`${user.username} Left room: ${user.room}`);
          socket.to(user.room).emit("chat", {
            message: `${user.username} Left Room ${user.room}`,
            system: true,
          });
          delete users[socket.id]; // Delete From User obj
        }
      });

      // connection errors
      socket.on("connect_error", (err) => {
        console.error("Socket connection error :", err);
      });
    });

    instance = { io, server };
  } catch (err) {
    console.log("Socket IO Error : ", err);
  }

  return instance;
}

export default ChatRoom;

import { Server } from "socket.io";
import { createServer } from "http";
import { sendMessage, subscribeToTopic, unsubscribeToTopic } from "./fcm_Service_Controller";

let instance;

function ChatRoom() {
  if (instance) return instance;

  try {
    const server = createServer();
    const io = new Server(server, {
      maxHttpBufferSize: 1e8,
      path: "/api/Chat",
      cors: {
        origin: "*",
      },
      transports: ["websocket"],
    });

    const port = process.env.Socket_Port;
    if (!port) console.warn("Port Not Available In Socket File.");
    server.listen(port, () => {
      console.log(`Socket.IO server listening on port ${port}`);
    });

    const users = new Map;

    io.on("connection", (socket) => {
      console.log("Socket is connected.");

      // join a chat
      socket.on("joinRoom",async ({ username, room, FCM_Token }) => {
        socket.join(room);
        users.set(socket.id, { username, room, FCM_Token });
        // console.log("Users List => ",users)
        console.log(`${username} Joined Room : ${room}`);
        socket.to(room).emit("chat", {
          message: `${username} Joined Room`,
          system: true,
        });
        
        if(FCM_Token) {
          await subscribeToTopic(FCM_Token,room);
          await sendMessage(username,room);
        }else{
          console.log("Tokens Not Available")}
      });

      // chat events
      socket.on("Group", (payload) => {
        const { room } = users.get(socket.id);
        if (room) {
          console.log("New Message in room:", room, payload);
          io.to(room).emit("chat", payload);
        }
      });

      // user disconnect
      socket.on("disconnect",async () => {
        const user = users.get(socket.id);
        console.log("user => ",user)
        if (user) {
          console.log(`${user.username} Left room: ${user.room}`);
          socket.to(user.room).emit("chat", {
            message: `${user.username} Left Room ${user.room}`,
            system: true,
          });
          await unsubscribeToTopic(user.FCM_Token, user.room);
          users.delete(socket.id); // Delete From User obj
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

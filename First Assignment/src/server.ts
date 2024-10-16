import * as express from "express";
import userRoutes from "./routes/customerRoutes";
import createRoutes from "./routes/UsersRoute";
import activeUser from "./routes/activeAccountRoute";
import "reflect-metadata";
import { AppPostgressSource } from "./config/data-source1";
import { AppMongoDBSource } from "./config/data-source2";
import { createServer } from "http";
import { Server } from "socket.io";
import * as cors from "cors";

const app = express();
app.use((request, response, next) => {
  console.log("Request URL => ", request.url);
  next();
});
const server = createServer(app);
const io = new Server(server);
// Middleware for CORS
app.use( cors({
    origin: "*"
  }));

// Middleware to parse JSON
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log("Request URL:", req.url);
  next();
});




// Store users and their associated rooms
const users = {};

io.on("connection", (socket) => {
  console.log("Socket is connected.");

  // Handle joining a chat room
  socket.on("joinRoom", ({ username, room }) => {
    socket.join(room);
    users[socket.id] = { username, room };
    console.log(`${username} joined room: ${room}`);
    socket
      .to(room)
      .emit("chat", {
        message: `${username} joined the room.`,
        system: true,
      });
  });

  // Handle chat events
  socket.on("chatRoom", (payload) => {
    const { room } = users[socket.id] || {};
    if (room) {
      console.log("New Message in room:", room, payload);
      io.to(room).emit("chat", payload); // Emit only to the specific room
    }
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    const user = users[socket.id];
    if (user) {
      console.log(`${user.username} disconnected from room: ${user.room}`);
      socket
        .to(user.room)
        .emit("chat", {
          message: `${user.username} left the room.`,
          system: true,
        });
      delete users[socket.id];
    }
  });

  // Handle connection errors
  socket.on("connect_error", (err) => {
    console.error("Socket connection error:", err);
  });
});




// Connect to databases
async function connectDatabases() {
  try {
    await AppPostgressSource.initialize();
    console.log("Postgres connected.");
    app.use("/api", userRoutes);
    app.use("/api", createRoutes);
    app.use("/api", activeUser);

    await AppMongoDBSource.initialize();
    console.log("MongoDB connected.");
  } catch (error) {
    console.error("Database connection error:", error);
  }
}

// Start the server
async function startServer() {
  await connectDatabases();
  const PORT = process.env.Server_Port || 3000;

  server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

// Call the function to start the server
startServer();

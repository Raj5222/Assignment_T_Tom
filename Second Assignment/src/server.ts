import express from "express";
import userRoutes from "./routes/customerRoutes";
import createRoutes from "./routes/UsersRoute";
import activeUser from "./routes/activeAccountRoute";
import "reflect-metadata";
import { AppPostgressSource } from "./config/data-source1";
import { AppMongoDBSource } from "./config/data-source2";
import cors from "cors";
import { hostname } from "os";
import * as dns from "dns"
import { config } from "dotenv";
import { Server } from "socket.io";
import { createServer } from "http";
import { ChatRoom } from "./controllers/Socket_FCM";
import { complains } from "./routes/complainRoutes";
config()



// import fcmRouter from "./routes/fcmRoute";
const app = express();
export const io = new Server(createServer(app),{
      maxHttpBufferSize: 100 * 1024 * 1024, // 100 MB
      // path: "/api/Chat",
      cors: {
        origin: "*",
      },
      transports: ["websocket"],
    })
app.use((request, response, next) => {
  console.log("Request URL => ",request.headers.origin," <=> ", request.url);
  next();
});
ChatRoom()

// Middleware for CORS
app.use( cors({
    origin: "*"
  }));

// Middleware to parse JSON
app.use(express.json());



// Connect to databases
async function connectDatabases() {
  try {
    await AppPostgressSource.initialize();
    console.log("Postgres connected.");

    await AppMongoDBSource.connect();
    console.log("MongoDB connected.");
  } catch (error) {
    console.error("Database connection error:", error);
  }
}


app.use("/api", createRoutes, userRoutes, activeUser, complains);

// app.use("/api", createRoutes);
// app.use("/api", activeUser);

// Redirect All Other URLs.


// Start the server
async function startServer() {
  await connectDatabases();
  const PORT:number = Number(process.env.Server_Port) || 3000;

  app.listen(PORT,'0.0.0.0', () => {
    const options = { family: 4 };
    dns.lookup(hostname(), options, async (err, addr) => {
      if (err) {
        console.error(err);
      } else {
        await console.log(`IPv4 address: http://${addr}:${PORT}`);
      }
    });
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

// Call the function to start the server
startServer();

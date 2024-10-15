import * as express from "express";
import userRoutes from "./routes/customerRoutes";
import createRoutes from "./routes/createRoute"
import activeUser from "./routes/activeAccountRoute";
import { create } from "express-handlebars";
import "reflect-metadata";
import { AppPostgressSource } from "./config/data-source1";
import { AppMongoDBSource } from "./config/data-source2";
import * as bodyParser from "body-parser";
import {createServer} from "http"
import { Server, Socket} from "socket.io"


const app = express();
const server = createServer(app)
app.use(bodyParser.json());
const PORT = process.env.Server_Port || 3000;

export const hbs = create({ extname: ".handlebars" }) //Handlebars Loading
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");

// Middleware to parse JSON
app.use(express.json());
Servers()

// Connect to database
async function Servers(){
// PostGres Connection
await AppPostgressSource.initialize()
  .then(() => {
    console.log("Postgres Connected.");

      app.use("/api", userRoutes);
      app.use("/api", createRoutes);
      app.use("/api", activeUser);
    
  })
  .catch((error) => console.log("Database connection error: ", error));

  // MongoDB Connection
  await AppMongoDBSource.initialize()
    .then(() => {
      console.log("MongoDB Connected.");
      // Use user routes
    })
    .catch((error) => console.log("Database connection error: ", error));

    const io = new Server(server);
    io.on("Connection", (socket) => {
      console.log("What Is Socket", socket);
      console.log("Socjet Is Active To be Connected.");
      socket.on("chat", (payload) => {
        console.log("Payload Is ", payload);
        io.emit("Chat", payload);
      });
    });
    
    // Start Server
    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  }
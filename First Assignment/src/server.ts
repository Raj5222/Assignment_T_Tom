import * as express from "express";
import userRoutes from "./routes/customerRoutes";
import createRoutes from "./routes/UsersRoute";
import activeUser from "./routes/activeAccountRoute";
import "reflect-metadata";
import { AppPostgressSource } from "./config/data-source1";
import { AppMongoDBSource } from "./config/data-source2";
import * as cors from "cors";
import socketRoute from "./routes/SocketRoute";

const app = express();
app.use((request, response, next) => {
  console.log("Request URL => ", request.url);
  next();
});

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




// Connect to databases
async function connectDatabases() {
  try {
    await AppPostgressSource.initialize();
    console.log("Postgres connected.");
    app.use("/api", userRoutes);
    app.use("/api", createRoutes);
    app.use("/api", activeUser);
    app.use("/api", socketRoute);

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

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

// Call the function to start the server
startServer();

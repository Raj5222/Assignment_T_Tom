import * as express from "express";
import userRoutes from "./routes/customerRoutes";
import createRoutes from "./routes/createRoute"
import activeUser from "./routes/activeAccountRoute";
import {AppPostgressSource} from "./config/data-source";
import "reflect-metadata";

const app = express();
const PORT = process.env.Server_Port || 3000;

// Middleware to parse JSON
app.use(express.json());

// Connect to database
AppPostgressSource.initialize()
  .then(() => {
    console.log("Postgres Connected.");
    
      app.use("/api", userRoutes);
      app.use("/api", createRoutes);
      app.use("/api", activeUser);
    
  })
  .catch((error) => console.log("Database connection error: ", error));

  // AppMongoDBSource.initialize()
  //   .then(() => {
  //     console.log("MongoDB Connected.");

  //     // Use user routes

  //     // Start the server
  //   })
  //   .catch((error) => console.log("Database connection error: ", error));
    
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
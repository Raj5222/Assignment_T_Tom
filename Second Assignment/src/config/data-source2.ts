import { config } from "dotenv";
import "reflect-metadata";
// import { DataSource } from "typeorm";
import { MongoClient } from "mongodb";
// import { Complain_MongoDB_Log } from "../entity/MongoDB_Complain";

config()
// Ensure that we have the necessary environment variables
if (!process.env.MongoDbString || !process.env.db2) {
  throw new Error("Missing necessary environment variables in .env file");
}

export const AppMongoDBSource = new MongoClient(process.env.MongoDbString,);

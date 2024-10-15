import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entity/Users";
import { Roles } from "../entity/Role";
import { Customer } from "../entity/Customer";
import { Mstaff9181002100000 } from "../migration/Muser";
import { MRole1696010000000 } from "../migration/Mrole";
import { config } from "dotenv";
import { User_Tr } from "../entity/Users_Tr";
import { UserTrts1728897062280 } from "../migration/1728897062280-User_Tr";
import { User_Trts1728906750764 } from "../migration/1728906750764-User__Tr.ts";

config()

// Ensure that we have the necessary environment variables
if (
  !process.env.type ||
  !process.env.host ||
  !process.env.port ||
  !process.env.username ||
  !process.env.password ||
  !process.env.database
) {
  throw new Error("Missing necessary environment variables in .env file");
}

export const AppPostgressSource = new DataSource({
  type: "postgres",
  host: process.env.host,
  port: parseInt(process.env.port),
  username: process.env.user,
  password: process.env.password,
  database: process.env.database,
  synchronize: true,
  logging: true,
  entities: [Roles, User, User_Tr, Customer],
  migrations: [
    MRole1696010000000,
    Mstaff9181002100000,
    UserTrts1728897062280,
    User_Trts1728906750764],
});
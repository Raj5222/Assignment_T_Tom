import { Router } from "express";
import Chat from "../controllers/Socket_FCM";

const socketRoute = Router();

socketRoute.use("/Chat", Chat);

export default socketRoute;

import { Router } from "express";
import { complainCreate} from "../controllers/complain_Create_Controller";
import { complainGet } from "../controllers/complain_Get_Controller";
import { complainUpdate } from "../controllers/Complain_update_Controller";

export const complains = Router();

complains.post("/complain", complainCreate);
complains.post("/getcomplain", complainGet);
complains.post("/updatecomplain", complainUpdate);


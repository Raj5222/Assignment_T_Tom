import { Router } from "express";
import { complainCreate} from "../controllers/complain_Create_Controller";
import { complainGet } from "../controllers/complain_Get_Controller";
import { complainUpdate } from "../controllers/Complain_update_Controller";
import { complain_form_create } from "../controllers/create_complain_form";

export const complains = Router();

complains.post("/complain", complainCreate);
complains.post("/getcomplain", complainGet);
complains.post("/updatecomplain", complainUpdate);
complains.post("/createform", complain_form_create);


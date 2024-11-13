import { Router } from "express";
import { complainCreate, complainGet, complainUpdate } from "../controllers/complainFormController";

export const complains = Router();

complains.post("/complain", complainCreate);
complains.post("/getcomplain", complainGet);
complains.post("/updatecomplain", complainUpdate);


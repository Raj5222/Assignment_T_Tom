import { Router } from "express";
import { fetchUsers, addUser, encry } from "../controllers/userCreateController";

const router = Router();

router.post("/login", fetchUsers);
router.post("/create", addUser);
router.post("/enc", encry);

export default router;

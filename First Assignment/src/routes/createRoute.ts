import { Router } from "express";
import { fetchUsers, encry, addUserStaff } from "../controllers/userCreateController";

const router = Router();

router.post("/login", fetchUsers);
router.post("/create", addUserStaff);
router.post("/enc", encry);

export default router;

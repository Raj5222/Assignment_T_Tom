import { Router, Express } from "express";
import { fetchUsers, encry, addUserStaff } from "../controllers/userCreateController";
import { pdfgenerate } from "../controllers/pdfController";

const router = Router();

router.post("/login", fetchUsers);
router.post("/create", addUserStaff);
router.post("/enc", encry);
router.get("/pdf", pdfgenerate);

export default router;

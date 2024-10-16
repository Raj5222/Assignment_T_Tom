import { Router} from "express";
import { encry, addUserStaff } from "../controllers/userCreateController";
import { pdfgenerate } from "../controllers/pdfController";
import { loginUsers } from "../controllers/loginUsersController";


const router = Router();

router.post("/login", loginUsers);
router.post("/create", addUserStaff);
router.post("/enc", encry);
router.get("/pdf", pdfgenerate);

export default router;

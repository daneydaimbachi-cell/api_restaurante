import { Router } from "express";
import { crearLogin,RegisterController } from "../controllers/auth/auth.controller.js";

const router = Router();

router.post("/login", crearLogin);
router.post("/register", RegisterController);

export default router;
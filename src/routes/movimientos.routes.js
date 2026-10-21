import { Router } from "express";
import { consultarMovimientos } from "../controllers/movimientos/movimientos.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/roles.middleware.js";

const router = Router();

router.get("/", verificarToken, checkRole("administrador", "operador", "auditor"),consultarMovimientos);

export default router;
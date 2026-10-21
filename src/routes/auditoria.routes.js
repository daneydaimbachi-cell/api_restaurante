import { Router } from "express";
import { consultarAuditoria } from "../controllers/auditoria/auditoria.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/roles.middleware.js";

const router = Router();

router.get("/", verificarToken, checkRole("administrador", "auditor"),consultarAuditoria);

export default router;
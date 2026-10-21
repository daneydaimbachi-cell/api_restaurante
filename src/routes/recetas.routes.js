import { Router } from "express";
import {
  consultarReceta,
  reemplazaringredientesReceta,
} from "../controllers/recetas/recetas.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/roles.middleware.js";

const router = Router();

router.get("/:productoId", verificarToken, checkRole("administrador", "operador"),consultarReceta);
router.put("/:productoId", verificarToken, checkRole("administrador"),reemplazaringredientesReceta);

export default router;
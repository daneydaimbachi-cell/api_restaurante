import { Router } from "express";
import {
  actualizarInsumos,
  crearInsumo,
  eliminarInsumo,
  listaInsumos,
} 
from "../controllers/insumos/insumos.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/roles.middleware.js";

const router = Router();

//LISTAR TODOS LOS INSUMOS
router.get("/", verificarToken, checkRole("administrador", "operador", "consulta", "auditor"), listaInsumos);

router.post("/", verificarToken, checkRole("administrador", "operador"), crearInsumo);
//CREAR INSUMO
router.put("/:id", verificarToken, checkRole("administrador", "operador"),actualizarInsumos);
//ELIMINAR INSUMO
router.delete("/:id",verificarToken, checkRole("administrador"), eliminarInsumo);

export default router;

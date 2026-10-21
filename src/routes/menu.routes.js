import { Router } from "express";
import {
  actualizarMenu,
  crearMenu,
  eliminarMenu,
  listaMenu,
} from "../controllers/menu/menu.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/roles.middleware.js";

const router = Router();

//LISTAR TODOS LOS MenuS
router.get("/", listaMenu);
//CREAR Menu
router.post("/", verificarToken, checkRole("administrador", "operador"),crearMenu);
//ACTUALIZAR Menu
router.put("/:id", verificarToken, checkRole("administrador", "operador"),actualizarMenu);
//ELIMINAR Menu
router.delete("/:id", verificarToken, checkRole("administrador"),eliminarMenu);

export default router;
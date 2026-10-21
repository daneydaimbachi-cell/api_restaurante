import { Router } from "express";
import {
 crearPedido,
 listarPedidos,
 consultarPedidoPorId,
} from "../controllers/pedidos/pedidos.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/roles.middleware.js";

const router = Router();

//CREAR PEDIDOS
router.post("/", verificarToken, checkRole("administrador", "operador"),crearPedido);
//LISTAR TODOS LOS PEDIDOS
router.get("/", verificarToken, checkRole("administrador", "operador", "consulta", "auditor"),listarPedidos);
//CONSULTAR PEDIDO POR ID
router.get("/:id", verificarToken, checkRole("administrador", "operador", "consulta", "auditor"),consultarPedidoPorId);

export default router;
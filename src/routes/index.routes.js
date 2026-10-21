import { Router } from "express";
import routerAuth from "./auth.routes.js";
import routerMenu from "./menu.routes.js";
import routerInsumos from "./insumos.routes.js";
import routerRecetas from "./recetas.routes.js";
import routerPedidos from "./pedidos.routes.js";
import routerMovimientos from "./movimientos.routes.js";
import routerAuditoria from "./auditoria.routes.js";

const router = Router();

//RUTA PRINCIPAL LOGIN
router.use("/auth", routerAuth);

//RUTA PRINCIPAL MENU
router.use("/menu", routerMenu);

//RUTA PRINCIPAL INSUMOS
router.use("/insumos", routerInsumos);

//RUTA PRINCIPAL RECETAS
router.use("/recetas", routerRecetas);

//RUTA PRINCIPAL PEDIDOS
router.use("/pedidos", routerPedidos);

//RUTA PRINCIPAL MOVIMIENTOS
router.use("/movimientos", routerMovimientos);


//RUTA PRINCIPAL AUDITORIA
router.use("/auditoria", routerAuditoria);

export default router;
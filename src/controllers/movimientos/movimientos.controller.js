import { listarMovimientosService } from "../../services/movimientos/movimientos.service.js";

export const consultarMovimientos = async (req, res, next) => {
  try {
    const movimientos = await listarMovimientosService(req.query);
    return res.status(200).json(movimientos);
  } catch (error) {
    next(error);
  }
};
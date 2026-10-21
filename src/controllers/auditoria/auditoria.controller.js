import { listarAuditoriaService } from "../../services/auditoria/auditoria.service.js";

export const consultarAuditoria = async (req, res, next) => {
  try {
    const registros = await listarAuditoriaService(req.query);
    return res.status(200).json(registros);
  } catch (error) {
    next(error);
  }
};
import { AppDataSource } from "../../config/conexion.js";

export const listarAuditoriaService = async (filtros = {}) => {
  const { usuario_id, accion, metodo, recurso, fecha } = filtros;
  const params = [];
  const condiciones = [];

  if (usuario_id) {
    params.push(usuario_id);
    condiciones.push(`a.usuario_id = $${params.length}`);
  }

  if (accion) {
    params.push(accion);
    condiciones.push(`a.accion = $${params.length}`);
  }

  if (metodo) {
    params.push(metodo);
    condiciones.push(`a.metodo = $${params.length}`);
  }

  if (recurso) {
    params.push(recurso);
    condiciones.push(`a.recurso = $${params.length}`);
  }

  if (fecha) {
    params.push(`${fecha}%`);
    condiciones.push(`a.fecha::text LIKE $${params.length}`);
  }

  const whereClause = condiciones.length > 0 ? `WHERE ${condiciones.join(" AND ")}` : "";

  const query = `
    SELECT 
      a.id,
      a.usuario_id,
      u.nombre AS usuario_nombre,
      a.accion,
      a.metodo,
      a.ruta,
      a.recurso,
      a.recurso_id,
      a.datos_anteriores,
      a.datos_nuevos,
      a.codigo_http,
      a.ip,
      a.user_agent,
      a.fecha
    FROM auditoria a
    LEFT JOIN usuarios u ON u.id = a.usuario_id
    ${whereClause}
    ORDER BY a.id DESC
  `;

  return await AppDataSource.query(query, params);
};
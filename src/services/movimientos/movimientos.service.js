import { AppDataSource } from "../../config/conexion.js";

export const listarMovimientosService = async (filtros = {}) => {
  const { insumo_id, tipo, fecha, pedido_id } = filtros;
  const params = [];
  const condiciones = [];

  if (insumo_id) {
    params.push(insumo_id);
    condiciones.push(`m.insumo_id = $${params.length}`);
  }

  if (tipo) {
    params.push(tipo);
    condiciones.push(`m.tipo = $${params.length}`);
  }

  if (pedido_id) {
    params.push(pedido_id);
    condiciones.push(`m.pedido_id = $${params.length}`);
  }

  if (fecha) {
    params.push(`${fecha}%`);
    condiciones.push(`m.fecha::text LIKE $${params.length}`);
  }

  const whereClause = condiciones.length > 0 ? `WHERE ${condiciones.join(" AND ")}` : "";

  const query = `
    SELECT 
      m.id,
      m.insumo_id,
      i.nombre AS insumo_nombre,
      i.unidad_medida,
      m.pedido_id,
      p.numero AS pedido_numero,
      m.usuario_id,
      u.nombre AS usuario_nombre,
      m.tipo,
      m.cantidad,
      m.stock_antes,
      m.stock_despues,
      m.fecha,
      m.motivo
    FROM movimientos_insumo m
    INNER JOIN insumos i ON i.id = m.insumo_id
    LEFT JOIN pedidos p ON p.id = m.pedido_id
    LEFT JOIN usuarios u ON u.id = m.usuario_id
    ${whereClause}
    ORDER BY m.id DESC
  `;

  return await AppDataSource.query(query, params);
};
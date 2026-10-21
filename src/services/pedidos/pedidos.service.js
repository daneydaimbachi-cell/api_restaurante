import { AppDataSource } from "../../config/conexion.js";

export const crearPedidoTransaccionalService = async ({
  usuario_id = 1,
  referencia_mesa = null,
  detalles = [],
  reqIp = null,
  reqUserAgent = null,
}) => {
  if (!detalles || detalles.length === 0) {
    const error = new Error("El pedido debe contener al menos un producto.");
    error.status = 400;
    throw error;
  }

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const productosMap = new Map();
    for (const item of detalles) {
      const cant = parseInt(item.cantidad, 10);
      if (isNaN(cant) || cant <= 0) {
        const error = new Error("La cantidad de cada producto debe ser mayor a cero.");
        error.status = 400;
        throw error;
      }
      productosMap.set(
        item.producto_menu_id,
        (productosMap.get(item.producto_menu_id) || 0) + cant
      );
    }

    let totalCalculado = 0;
    const detallesInsertar = [];
    const consumoInsumosMap = new Map();

    for (const [productoId, cantidad] of productosMap.entries()) {
      const prodRes = await queryRunner.query(
        `SELECT id, nombre, precio, activo FROM productos_menu WHERE id = $1`,
        [productoId]
      );

      if (prodRes.length === 0 || !prodRes[0].activo) {
        const error = new Error(`El producto con ID ${productoId} no existe o no está activo.`);
        error.status = 400;
        throw error;
      }

      const prod = prodRes[0];
      const precioUnitario = Number(prod.precio);
      const subtotal = precioUnitario * cantidad;
      totalCalculado += subtotal;

      detallesInsertar.push({
        producto_menu_id: prod.id,
        cantidad,
        precio_unitario: precioUnitario,
        subtotal,
      });

      const receta = await queryRunner.query(
        `SELECT insumo_id, cantidad_por_porcion FROM receta_detalle WHERE producto_menu_id = $1`,
        [prod.id]
      );

      for (const ingrediente of receta) {
        const gastoInsumo = Number(ingrediente.cantidad_por_porcion) * cantidad;
        consumoInsumosMap.set(
          ingrediente.insumo_id,
          (consumoInsumosMap.get(ingrediente.insumo_id) || 0) + gastoInsumo
        );
      }
    }

    const insumosIds = Array.from(consumoInsumosMap.keys());
    const insumosAfectados = [];

    for (const insumoId of insumosIds) {
      const insumoRes = await queryRunner.query(
        `SELECT id, nombre, stock FROM insumos WHERE id = $1 FOR UPDATE`,
        [insumoId]
      );

      if (insumoRes.length === 0) {
        const error = new Error(`El insumo con ID ${insumoId} no existe.`);
        error.status = 400;
        throw error;
      }

      const insumo = insumoRes[0];
      const stockActual = Number(insumo.stock);
      const requerido = consumoInsumosMap.get(insumoId);

      if (stockActual < requerido) {
        const error = new Error(
          `Stock insuficiente para '${insumo.nombre}'. Disponible: ${stockActual}, Requerido: ${requerido}.`
        );
        error.status = 400;
        throw error;
      }

      insumosAfectados.push({
        id: insumo.id,
        stock_antes: stockActual,
        cantidad_descontar: requerido,
        stock_despues: stockActual - requerido,
      });
    }

    const numeroPedido = `PED-${Date.now()}`;
    const pedidoInsert = await queryRunner.query(
      `INSERT INTO pedidos (numero, usuario_id, referencia_mesa, estado, total)
       VALUES ($1, $2, $3, 'confirmado', $4)
       RETURNING id, numero, usuario_id, referencia_mesa, fecha, estado, total`,
      [numeroPedido, usuario_id, referencia_mesa, totalCalculado]
    );
    const nuevoPedido = pedidoInsert[0];

    for (const det of detallesInsertar) {
      await queryRunner.query(
        `INSERT INTO detalle_pedido (pedido_id, producto_menu_id, cantidad, precio_unitario, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [nuevoPedido.id, det.producto_menu_id, det.cantidad, det.precio_unitario, det.subtotal]
      );
    }

    for (const mov of insumosAfectados) {
      await queryRunner.query(
        `UPDATE insumos SET stock = $1 WHERE id = $2`,
        [mov.stock_despues, mov.id]
      );

      await queryRunner.query(
        `INSERT INTO movimientos_insumo 
         (insumo_id, pedido_id, usuario_id, tipo, cantidad, stock_antes, stock_despues, motivo)
         VALUES ($1, $2, $3, 'consumo', $4, $5, $6, $7)`,
        [
          mov.id,
          nuevoPedido.id,
          usuario_id,
          mov.cantidad_descontar,
          mov.stock_antes,
          mov.stock_despues,
          `Consumo por pedido ${nuevoPedido.numero}`,
        ]
      );
    }

    await queryRunner.query(
      `INSERT INTO auditoria 
       (usuario_id, accion, metodo, ruta, recurso, recurso_id, datos_anteriores, datos_nuevos, codigo_http, ip, user_agent)
       VALUES ($1, 'CREAR', 'POST', '/api/pedidos', 'pedidos', $2, NULL, $3, 201, $4, $5)`,
      [
        usuario_id,
        nuevoPedido.id.toString(),
        JSON.stringify({ pedido: nuevoPedido, items: detallesInsertar }),
        reqIp,
        reqUserAgent,
      ]
    );

    await queryRunner.commitTransaction();

    return {
      ...nuevoPedido,
      detalles: detallesInsertar,
    };
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
};

export const listarPedidosService = async (filtros = {}) => {
  const { estado, fecha, mesa } = filtros;
  const params = [];
  const condiciones = [];

  if (estado) {
    params.push(estado);
    condiciones.push(`p.estado = $${params.length}`);
  }

  if (mesa) {
    params.push(mesa);
    condiciones.push(`p.referencia_mesa = $${params.length}`);
  }

  if (fecha) {
    params.push(`${fecha}%`);
    condiciones.push(`p.fecha::text LIKE $${params.length}`);
  }

  const whereClause = condiciones.length > 0 ? `WHERE ${condiciones.join(" AND ")}` : "";

  const query = `
    SELECT p.id, p.numero, p.usuario_id, u.nombre AS usuario_nombre,
           p.referencia_mesa, p.fecha, p.estado, p.total
    FROM pedidos p
    LEFT JOIN usuarios u ON u.id = p.usuario_id
    ${whereClause}
    ORDER BY p.id DESC
  `;

  return await AppDataSource.query(query, params);
};

export const obtenerPedidoPorIdService = async (id) => {
  const pedidoRes = await AppDataSource.query(
    `SELECT p.id, p.numero, p.usuario_id, u.nombre AS usuario_nombre,
            p.referencia_mesa, p.fecha, p.estado, p.total
     FROM pedidos p
     LEFT JOIN usuarios u ON u.id = p.usuario_id
     WHERE p.id = $1`,
    [id]
  );

  if (pedidoRes.length === 0) return null;

  const detalles = await AppDataSource.query(
    `SELECT dp.id, dp.producto_menu_id, pm.nombre AS producto_nombre,
            dp.cantidad, dp.precio_unitario, dp.subtotal
     FROM detalle_pedido dp
     INNER JOIN productos_menu pm ON pm.id = dp.producto_menu_id
     WHERE dp.pedido_id = $1
     ORDER BY dp.id ASC`,
    [id]
  );

  return {
    ...pedidoRes[0],
    detalles,
  };
};
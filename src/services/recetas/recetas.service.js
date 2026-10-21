import { AppDataSource } from "../../config/conexion.js";

export const consultarRecetaService = async (productoId) => {
  const productoResult = await AppDataSource.query(
    `SELECT id, codigo, nombre, precio, activo 
     FROM productos_menu 
     WHERE id = $1`,
    [productoId]
  );

  if (productoResult.length === 0) {
    return null;
  }

  const ingredientes = await AppDataSource.query(
    `SELECT 
        rd.id AS receta_detalle_id,
        rd.insumo_id,
        i.codigo AS insumo_codigo,
        i.nombre AS insumo_nombre,
        i.unidad_medida,
        rd.cantidad_por_porcion
     FROM receta_detalle rd
     INNER JOIN insumos i ON i.id = rd.insumo_id
     WHERE rd.producto_menu_id = $1
     ORDER BY rd.id ASC`,
    [productoId]
  );

  return {
    producto: productoResult[0],
    ingredientes,
  };
};

export const reemplazarRecetaService = async (productoId, ingredientes = []) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const productoResult = await queryRunner.query(
      `SELECT id, codigo, nombre, activo FROM productos_menu WHERE id = $1`,
      [productoId]
    );

    if (productoResult.length === 0) {
      await queryRunner.rollbackTransaction();
      return { encontrado: false };
    }

    const recetaAnterior = await queryRunner.query(
      `SELECT id, producto_menu_id, insumo_id, cantidad_por_porcion
       FROM receta_detalle
       WHERE producto_menu_id = $1
       ORDER BY id ASC`,
      [productoId]
    );

    for (const item of ingredientes) {
      const insumoResult = await queryRunner.query(
        `SELECT id, activo FROM insumos WHERE id = $1`,
        [item.insumo_id]
      );

      if (insumoResult.length === 0 || !insumoResult[0].activo) {
        await queryRunner.rollbackTransaction();
        return {
          encontrado: true,
          errorValidacion: `El insumo con ID ${item.insumo_id} no existe o está inactivo.`,
        };
      }
    }

    await queryRunner.query(
      `DELETE FROM receta_detalle WHERE producto_menu_id = $1`,
      [productoId]
    );

    const recetaNueva = [];
    for (const item of ingredientes) {
      const insertado = await queryRunner.query(
        `INSERT INTO receta_detalle (producto_menu_id, insumo_id, cantidad_por_porcion)
         VALUES ($1, $2, $3)
         RETURNING id, producto_menu_id, insumo_id, cantidad_por_porcion`,
        [productoId, item.insumo_id, item.cantidad_por_porcion]
      );
      recetaNueva.push(insertado[0]);
    }

    await queryRunner.commitTransaction();

    return {
      encontrado: true,
      producto: productoResult[0],
      anterior: recetaAnterior,
      nuevo: recetaNueva,
    };
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
};
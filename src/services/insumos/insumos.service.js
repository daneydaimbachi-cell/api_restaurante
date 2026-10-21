import { AppDataSource } from "../../config/conexion.js";

export const listaInsumosService = async (req, res) => {
  const insumos = await AppDataSource.createQueryBuilder()
    .select()
    .from("insumos")
    .getRawMany();

  return insumos;
};

export const crearInsumoService = async ({
  codigo,
  nombre,
  unidad_medida,
  stock,
  stock_minimo,
  activo,
}) => {
  const query = `INSERT INTO INSUMOS (codigo, NOMBRE, UNIDAD_MEDIDA, STOCK, STOCK_MINIMO, ACTIVO) 
  VALUES ($1, $2, $3, $4, $5, $6) 
  RETURNING codigo, NOMBRE, UNIDAD_MEDIDA, STOCK, STOCK_MINIMO, ACTIVO`;

  const result = await AppDataSource.query(query, [
    codigo,
    nombre,
    unidad_medida,
    stock,
    stock_minimo,
    activo,
  ]);

  return result[0];
};

export const actualizarInsumoService = async (
  id,
  { codigo, nombre, unidad_medida, stock, stock_minimo, activo },
) => {
  const result = await AppDataSource.createQueryBuilder()
    .update("insumos")
    .set({
      codigo: codigo,
      nombre: nombre,
      unidad_medida,
      stock,
      stock_minimo,
      activo,
    })
    .where("id = :id", { id: id })
    .returning("*")
    .execute();

  return result.raw[0] || null;
};

export const eliminarInsumoService = async (id) => {
  const result = await AppDataSource.createQueryBuilder()
    .delete()
    .from("insumos")
    .where("id = :id", { id })
    .execute();

  return result.affected > 0;
};

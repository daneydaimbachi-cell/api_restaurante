import { AppDataSource } from "../../config/conexion.js";

export const listaMenuService = async (req, res) => {
  const menu = await AppDataSource.createQueryBuilder()
    .select()
    .from("productos_menu")
    .getRawMany();

  return menu;
};

export const crearMenuService = async ({
  codigo,
  nombre,
  descripcion,
  precio,
  activo,
}) => {
  const query = `INSERT INTO productos_menu (codigo, nombre, descripcion, precio, activo) 
  VALUES ($1, $2, $3, $4, $5) 
  RETURNING codigo, nombre, descripcion, precio, activo`;

  const result = await AppDataSource.query(query, [
    codigo,
    nombre,
    descripcion,
    precio,
    activo,
  ]);

  return result[0];
};

export const actualizarMenuService = async (
  id,
  { codigo, nombre, descripcion, precio, activo },
) => {
  const result = await AppDataSource.createQueryBuilder()
    .update("productos_menu")
    .set({
        codigo,
        nombre,
        descripcion,
        precio,
        activo,
    })
    .where("id = :id", { id: id })
    .returning("*")
    .execute();

  return result.raw[0] || null;
};

export const eliminarMenuService = async (id) => {
  const result = await AppDataSource.createQueryBuilder()
    .delete()
    .from("productos_menu")
    .where("id = :id", { id })
    .execute();

  return result.affected > 0;
};
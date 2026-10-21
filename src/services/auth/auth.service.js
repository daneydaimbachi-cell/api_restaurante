import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../../config/conexion.js";

export const loginService = async (correo, password) => {
  const usuarios = await AppDataSource.query(
    `SELECT id, nombre, correo, password_hash, rol, activo 
     FROM usuarios 
     WHERE correo = $1`,
    [correo],
  );

  if (usuarios.length === 0) {
    const error = new Error("Correo inválido");
    error.status = 401;
    throw error;
  }

  const usuario = usuarios[0];

  if (!usuario.activo) {
    const error = new Error("Usuario inactivo en el sistema");
    error.status = 403;
    throw error;
  }

  const passwordValido = await bcrypt.compare(password, usuario.password_hash);
  if (!passwordValido) {
    const error = new Error("Credenciales inválidas");
    error.status = 401;
    throw error;
  }

  const secret = process.env.JWT_SECRET || "default_secret";
  const token = jwt.sign(
    {
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
    },
    secret,
    { expiresIn: "8h" },
  );

  return {
    token,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
    },
  };
};

export const register = async ({ nombre, correo, password_hash, rol }) => {
  // 1. Validar si el correo ya existe
  const usuariosExistentes = await AppDataSource.query(
    `SELECT id FROM usuarios WHERE correo = $1`,
    [correo],
  );

  if (usuariosExistentes.length > 0) {
    const error = new Error("El correo ya se encuentra registrado");
    error.status = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password_hash, 12);

  const query = `
    INSERT INTO usuarios (nombre, correo, password_hash, rol)
    VALUES ($1, $2, $3, $4)
    RETURNING id, nombre, correo, rol, activo;
  `;

  const resultado = await AppDataSource.query(query, [
    nombre,
    correo,
    passwordHash,
    rol,
  ]);

  return resultado[0];
};

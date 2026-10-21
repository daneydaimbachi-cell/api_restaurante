import { loginService, register } from "../../services/auth/auth.service.js";

export const crearLogin = async (req, res, next) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({
        error: "Los campos correo y password son obligatorios",
      });
    }

    const resultado = await loginService(correo, password);

    return res.status(200).json({
      mensaje: "Inicio de sesión exitoso",
      ...resultado,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    next(error);
  }
};

export const RegisterController = async (req, res, next) => {
  try {
    const {nombre, correo, password_hash, rol} = req.body;

    if (!nombre || !correo || !password_hash || !rol) {
      return res.status(400).json({
        error: "Los campos correo y password son obligatorios",
      });
    }

    const resultado = await register({nombre, correo, password_hash, rol});

    return res.status(200).json({
      mensaje: "Inicio de sesión exitoso",
      ...resultado,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    next(error);
  }
};
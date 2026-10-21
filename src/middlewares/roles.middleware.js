export const checkRole = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Acceso no autorizado. Información de usuario no encontrada.",
      });
    }

    if (!rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({
        error:
          "Acceso denegado. No tienes los permisos necesarios para este recurso.",
      });
    }

    next();
  };
};

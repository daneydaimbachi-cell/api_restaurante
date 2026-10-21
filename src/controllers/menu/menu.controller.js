import {
    actualizarMenuService,
    crearMenuService,
    eliminarMenuService,
    listaMenuService,
  } from "../../services/menu/menu.service.js";
  
  export const listaMenu = async (req, res) => {
    try {
      const menu = await listaMenuService();
  
      return res.status(200).json({
        success: true,
        data: menu,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al consultar Menu",
        error: error.message,
      });
    }
  };
  
  export const crearMenu = async (req, res) => {
    try {
      const { codigo, nombre, descripcion, precio, activo } =
        req.body;
  
      if (!codigo || !nombre || !descripcion || !precio || !activo) {
        return res.status(400).json({
          success: false,
          message: "Por favor ingrese todos los campos",
        });
      }
  
      const nuevoMenu = await crearMenuService({
        codigo,
        nombre,
        descripcion,
        precio,
        activo,
        
      });
  
      return res.status(201).json({
        success: true,
        message: "Menu insertado exitosamente",
        data: nuevoMenu,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al insertar Menu en la base de datos",
        error: error.message,
      });
    }
  };
  
  export const actualizarMenu = async (req, res) => {
    try {
      const { id } = req.params;
      const { codigo, nombre, descripcion, precio, activo } =
        req.body;
  
      if (
        !id ||
        !codigo ||
        !nombre ||
        !descripcion ||
        precio === undefined ||
        precio === null ||
        activo === undefined ||
        activo === null 
      ) {
        return res.status(400).json({
          success: false,
          message: "Por favor ingrese todos los campos requeridos",
        });
      }
  
      const actualizacionMenu = await actualizarMenuService(id, {
        codigo,
        nombre,
        descripcion,
        precio,
        activo,
        
      });
  
      if (!actualizacionMenu) {
        return res.status(404).json({
          success: false,
          message: `No se encontró ningún Menu con el ID ${id}`,
        });
      }
  
      return res.status(200).json({
        success: true,
        message: "Menu actualizado exitosamente",
        data: actualizacionMenu,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al actualizar Menu",
        error: error.message,
      });
    }
  };
  
  export const eliminarMenu = async (req, res) => {
    try {
      const { id } = req.params;
  
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Por favor ingrese el ID del Menu a eliminar",
        });
      }
  
      const fueEliminado = await eliminarMenuService(id);
  
      if (!fueEliminado) {
        return res.status(404).json({
          success: false,
          message: `No se encontró ningún Menu con el ID ${id}`,
        });
      }
  
      return res.status(200).json({
        success: true,
        message: "Menu eliminado exitosamente",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error al eliminar Menu",
        error: error.message,
      });
    }
  };
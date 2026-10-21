import {
    consultarRecetaService,
    reemplazarRecetaService,
  } from "../../services/recetas/recetas.service.js";
  
  export const consultarReceta = async (req, res, next) => {
    try {
      const { productoId } = req.params;
      const receta = await consultarRecetaService(productoId);
  
      if (!receta) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }
  
      return res.status(200).json(receta);
    } catch (error) {
      next(error);
    }
  };
  
  export const reemplazaringredientesReceta = async (req, res, next) => {
    try {
      const { productoId } = req.params;
      const { ingredientes } = req.body;
  
      if (!Array.isArray(ingredientes) || ingredientes.length === 0) {
        return res.status(400).json({
          error: "Debes enviar un arreglo de 'ingredientes' con al menos un elemento.",
        });
      }
  
      for (const item of ingredientes) {
        if (!item.insumo_id || !item.cantidad_por_porcion || Number(item.cantidad_por_porcion) <= 0) {
          return res.status(400).json({
            error: "Cada ingrediente debe tener un 'insumo_id' válido y 'cantidad_por_porcion' mayor a 0.",
          });
        }
      }
  
      const resultado = await reemplazarRecetaService(productoId, ingredientes);
  
      if (!resultado.encontrado) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }
  
      if (resultado.errorValidacion) {
        return res.status(400).json({ error: resultado.errorValidacion });
      }
  
      return res.status(200).json({
        mensaje: "Receta actualizada exitosamente",
        producto: resultado.producto,
        receta: resultado.nuevo,
      });
    } catch (error) {
      next(error);
    }
  };
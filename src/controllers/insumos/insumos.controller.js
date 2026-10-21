import {
  actualizarInsumoService,
  crearInsumoService,
  eliminarInsumoService,
  listaInsumosService,
} from "../../services/insumos/insumos.service.js";

export const listaInsumos = async (req, res) => {
  try {
    const insumos = await listaInsumosService();

    return res.status(200).json({
      success: true,
      data: insumos,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al consultar insumos",
      error: error.message,
    });
  }
};

export const crearInsumo = async (req, res) => {
  try {
    const { codigo, nombre, unidad_medida, stock, stock_minimo, activo } =
      req.body;

    if (!codigo || !nombre || !unidad_medida || !stock || !stock_minimo || !activo) {
      return res.status(400).json({
        success: false,
        message: "Por favor ingrese todos los campos",
      });
    }

    const nuevoInsumo = await crearInsumoService({
      codigo,
      nombre,
      unidad_medida,
      stock,
      stock_minimo,
      activo,
    });

    return res.status(201).json({
      success: true,
      message: "Insumo insertado exitosamente",
      data: nuevoInsumo,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al insertar insumo en la base de datos",
      error: error.message,
    });
  }
};

export const actualizarInsumos = async (req, res) => {
  try {
    const { id } = req.params;
    const { codigo, nombre, unidad_medida, stock, stock_minimo, activo } =
      req.body;

    if (
      !id ||
      !codigo ||
      !nombre ||
      !unidad_medida ||
      stock === undefined ||
      stock === null ||
      stock_minimo === undefined ||
      stock_minimo === null ||
      activo === undefined ||
      activo === null
    ) {
      return res.status(400).json({
        success: false,
        message: "Por favor ingrese todos los campos requeridos",
      });
    }

    const actualizacionInsumo = await actualizarInsumoService(id, {
      codigo,
      nombre,
      unidad_medida,
      stock,
      stock_minimo,
      activo,
    });

    if (!actualizacionInsumo) {
      return res.status(404).json({
        success: false,
        message: `No se encontró ningún insumo con el ID ${id}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Insumo actualizado exitosamente",
      data: actualizacionInsumo,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al actualizar insumo",
      error: error.message,
    });
  }
};

export const eliminarInsumo = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Por favor ingrese el ID del insumo a eliminar",
      });
    }

    const fueEliminado = await eliminarInsumoService(id);

    if (!fueEliminado) {
      return res.status(404).json({
        success: false,
        message: `No se encontró ningún insumo con el ID ${id}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Insumo eliminado exitosamente",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al eliminar insumo",
      error: error.message,
    });
  }
};

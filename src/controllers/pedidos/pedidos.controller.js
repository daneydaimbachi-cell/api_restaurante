import {
    crearPedidoTransaccionalService,
    listarPedidosService,
    obtenerPedidoPorIdService,
  } from "../../services/pedidos/pedidos.service.js";
  
  export const crearPedido = async (req, res, next) => {
    try {
      const { referencia_mesa, detalles, usuario_id } = req.body;
  
      const resultado = await crearPedidoTransaccionalService({
        usuario_id: usuario_id || 1,
        referencia_mesa,
        detalles,
        reqIp: req.ip || req.connection?.remoteAddress,
        reqUserAgent: req.headers["user-agent"],
      });
  
      return res.status(201).json({
        mensaje: "Pedido registrado y confirmado exitosamente",
        pedido: resultado,
      });
    } catch (error) {
      if (error.status === 400) {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  };
  
  export const listarPedidos = async (req, res, next) => {
    try {
      const pedidos = await listarPedidosService(req.query);
      return res.status(200).json(pedidos);
    } catch (error) {
      next(error);
    }
  };
  
  export const consultarPedidoPorId = async (req, res, next) => {
    try {
      const { id } = req.params;
      const pedido = await obtenerPedidoPorIdService(id);
  
      if (!pedido) {
        return res.status(404).json({ error: "Pedido no encontrado" });
      }
  
      return res.status(200).json(pedido);
    } catch (error) {
      next(error);
    }
  };
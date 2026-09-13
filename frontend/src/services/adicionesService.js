import api from './api';

export const adicionesService = {
  // Obtener todas las adiciones del restaurante para el cliente
  obtenerParaCliente: () => api.get('/adiciones/cliente'),
  // O si tu endpoint en NestJS es directo:
  obtenerTodas: () => api.get('/adiciones'),
};
import { useState, useEffect } from 'react'
import { pedidosService } from '../../services/pedidosService'
import { useNavigate } from 'react-router-dom'
import Loading from '../../components/shared/Loading'
import Alert from '../../components/shared/Alert'
import Modal from '../../components/shared/Modal'
import { Eye, RefreshCw, ClipboardList, Package, User, MapPin } from 'lucide-react'

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)
  const [estadoFiltro, setEstadoFiltro] = useState('')
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    cargarPedidos()
    
    const interval = setInterval(cargarPedidos, 15000)
    const handleFocus = () => cargarPedidos()
    window.addEventListener('focus', handleFocus)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
    }
  }, [estadoFiltro])

  const cargarPedidos = async () => {
    try {
      const res = await pedidosService.obtenerTodos(estadoFiltro || undefined)
      setPedidos(res.data)
      
      setPedidoSeleccionado(prev => {
        if (!prev) return null;
        const actualizado = res.data.find(p => p.id === prev.id);
        return actualizado || prev;
      });
    } catch (error) {
      setAlert({ type: 'error', message: 'Error cargando pedidos' })
    } finally {
      setLoading(false)
    }
  }

  const abrirDetalles = (pedido) => {
    setPedidoSeleccionado(pedido)
    setModalOpen(true)
  }

  const cambiarEstado = async (pedidoId, nuevoEstado) => {
    try {
      const res = await pedidosService.cambiarEstado(pedidoId, {
        estado: nuevoEstado,
      })
      setAlert({ type: 'success', message: 'Estado actualizado correctamente' })
      cargarPedidos()
      
      const pedidoActualizado = res.data?.pedido || res.data || { ...pedidoSeleccionado, estado: nuevoEstado }
      setPedidoSeleccionado(pedidoActualizado)
    } catch (error) {
      console.error("Error detallado al cambiar estado:", error.response?.data || error);
      const mensajeReal = error.response?.data?.message || error.message || 'Error al cambiar estado';
      setAlert({ type: 'error', message: mensajeReal })
    }
  }

  const formatearPrecio = (precio) => {
    const valorSeguro = Number(precio) || 0;
    const precioRedondeado = Math.round(valorSeguro);
    return new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP', 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }).format(precioRedondeado);
  }

  const formatearFecha = (fechaIso) => {
    if (!fechaIso) return 'Fecha no disponible';
    
    let fechaStr = fechaIso;
    if (typeof fechaIso === 'string') {
      if (!fechaIso.endsWith('Z') && !fechaIso.includes('+')) {
        fechaStr = fechaIso + 'Z';
      }
    }

    const fecha = new Date(fechaStr);
    if (isNaN(fecha.getTime())) return 'Fecha inválida';

    return fecha.toLocaleString('es-CO', {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  if (loading && pedidos.length === 0) return <Loading />

  return (
    <div className="space-y-6 text-[#f5ead8] animate-fade-in pb-12">
      
      {/* ========== HEADER ========== */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#231a0d] border border-[#3a2a18] p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#f5ead8] flex items-center gap-2">
            <ClipboardList className="text-[#e8621a]" size={30} />
            Gestión de Pedidos
          </h1>
          <p className="text-xs sm:text-sm text-[#9c8a6e] mt-1">Supervisa y actualiza el flujo de pedidos en tiempo real (Hora Colombia).</p>
        </div>
        <button
          onClick={cargarPedidos}
          className="bg-[#1a1209] hover:bg-[#2e2010] text-[#f5ead8] border border-[#3a2a18] px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 shadow-inner hover:-translate-y-0.5"
        >
          <RefreshCw size={18} className="text-[#e8621a]" />
          <span className="text-sm">Actualizar Lista</span>
        </button>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* ========== FILTROS ========== */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
        {['', 'PENDIENTE', 'CONFIRMADO', 'PREPARANDO', 'LISTO', 'EN_CAMINO', 'ENTREGADO', 'RECHAZADO'].map(
          estado => (
            <button
              key={estado}
              onClick={() => setEstadoFiltro(estado)}
              className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 whitespace-nowrap border shadow-sm hover:-translate-y-0.5 ${
                estadoFiltro === estado
                  ? 'bg-[#e8621a] text-white border-[#e8621a] shadow-[0_0_12px_rgba(232,98,26,0.4)]'
                  : 'bg-[#231a0d] text-[#9c8a6e] border-[#3a2a18] hover:text-[#f5ead8]'
              }`}
            >
              {estado || 'Todos'}
            </button>
          )
        )}
      </div>

      {/* ========== TABLA ========== */}
      <div className="bg-[#231a0d] border border-[#3a2a18] rounded-2xl sm:rounded-3xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[800px]">
            <thead>
              <tr className="border-b border-[#3a2a18] text-[#9c8a6e] text-xs uppercase tracking-wider bg-[#1a1209]/40">
                <th className="py-4 px-5">Pedido / Hora</th>
                <th className="py-4 px-5">Cliente</th>
                <th className="py-4 px-5">Total</th>
                <th className="py-4 px-5">Estado</th>
                <th className="py-4 px-5">Pago</th>
                <th className="py-4 px-5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3a2a18]/50">
              {pedidos.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-16 text-[#9c8a6e]">
                    <Package size={42} className="mx-auto mb-3 opacity-40" />
                    <p className="font-serif text-base text-[#f5ead8]">No hay pedidos con este filtro</p>
                  </td>
                </tr>
              ) : (
                pedidos.map(pedido => (
                  <tr key={pedido.id} className="hover:bg-[#1a1209]/60 transition-colors">
                    <td className="py-4 px-5">
                      <span className="font-serif font-bold text-[#f0a030] block">#{ pedido.numero_pedido}</span>
                      <span className="text-xs text-[#9c8a6e]">{formatearFecha(pedido.created_at)}</span>
                    </td>
                    <td className="py-4 px-5 text-[#f5ead8] font-medium">{pedido.cliente?.nombre || 'Cliente'}</td>
                    <td className="py-4 px-5 font-bold text-[#f5ead8]">{formatearPrecio(pedido.subtotal)}</td>
                    <td className="py-4 px-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm inline-block ${
                        pedido.estado === 'PENDIENTE' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                        pedido.estado === 'CONFIRMADO' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                        pedido.estado === 'PREPARANDO' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
                        pedido.estado === 'LISTO' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' :
                        pedido.estado === 'EN_CAMINO' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                        pedido.estado === 'ENTREGADO' ? 'bg-teal-500/10 border-teal-500/20 text-teal-400' :
                        'bg-red-500/10 border-red-500/20 text-red-400'
                      }`}>
                        {pedido.estado}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border inline-block ${
                        pedido.metodo_pago === 'EFECTIVO' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                        pedido.metodo_pago === 'TRANSFERENCIA' || pedido.metodo_pago === 'NEQUI' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                        'bg-purple-500/10 border-purple-500/20 text-purple-400'
                      }`}>
                        {pedido.metodo_pago}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-center">
                      <button
                        onClick={() => abrirDetalles(pedido)}
                        className="bg-[#1a1209] border border-[#3a2a18] text-[#f0a030] hover:bg-[#e8621a] hover:text-white p-2.5 rounded-xl transition-all duration-300 shadow-sm inline-flex items-center justify-center"
                        title="Ver detalles"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========== MODAL DE DETALLES ========== */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Pedido #${pedidoSeleccionado?.numero_pedido}`}
        size="lg"
      >
        {pedidoSeleccionado && (
          <div className="space-y-6 text-[#f5ead8] pt-4">
            
            {/* ========== CLIENTE Y ENTREGA ========== */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#1a1209] border border-[#3a2a18] p-4 rounded-2xl space-y-2.5">
                <h3 className="font-serif font-bold text-sm text-[#f0a030] flex items-center gap-2">
                  <User size={16} /> Información del Cliente
                </h3>
                <p className="text-sm"><strong>Nombre:</strong> {pedidoSeleccionado.cliente?.nombre}</p>
                <p className="text-sm"><strong>Teléfono:</strong> {pedidoSeleccionado.cliente?.telefono}</p>
                <p className="text-xs text-[#9c8a6e] pt-1">Hora: {formatearFecha(pedidoSeleccionado.created_at)}</p>
              </div>

              <div className="bg-[#1a1209] border border-[#3a2a18] p-4 rounded-2xl space-y-2.5">
                <h3 className="font-serif font-bold text-sm text-[#f0a030] flex items-center gap-2">
                  <MapPin size={16} /> Datos de Entrega
                </h3>
                <p className="text-sm"><strong>Dirección:</strong> {pedidoSeleccionado.direccion}</p>
                {pedidoSeleccionado.referencia && <p className="text-sm"><strong>Referencia:</strong> {pedidoSeleccionado.referencia}</p>}
              </div>
            </div>

            {/* ========== PRODUCTOS ========== */}
            <div className="bg-[#1a1209] border border-[#3a2a18] p-4 rounded-2xl space-y-3">
              <h3 className="font-serif font-bold text-sm text-[#f0a030] flex items-center gap-2">
                <Package size={16} /> Productos Solicitados
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {pedidoSeleccionado.detalles?.map(d => (
                  <div key={d.id} className="flex justify-between items-center p-3 bg-[#231a0d] border border-[#3a2a18] rounded-xl text-sm hover:border-[#e8621a]/50 transition">
                    <div>
                      <span className="font-medium">{d.producto?.nombre || 'Plato del menú'}</span>
                      {d.productoPorcion && (
                        <span className="text-xs text-[#f0a030] block font-semibold">
                          Porción: {d.productoPorcion.gramos}g
                        </span>
                      )}
                      <span className="text-[#e8621a] font-bold ml-2 text-xs">x{d.cantidad}</span>
                    </div>
                    <span className="font-bold text-[#f0a030]">{formatearPrecio(d.precio_unitario_en_momento * d.cantidad)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ========== TOTALES ========== */}
            <div className="bg-[#1a1209] border border-[#3a2a18] p-4 rounded-2xl space-y-2">
              <div className="flex justify-between text-sm text-[#9c8a6e]">
                <span>Subtotal platos:</span>
                <span>{formatearPrecio(pedidoSeleccionado.subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-[#e8621a] pb-3 border-b border-[#3a2a18] font-medium">
                <span>Costo de domicilio:</span>
                <span>Pago al repartidor</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-1">
                <span>Total a cobrar:</span>
                <span className="text-[#f0a030] text-xl font-serif">{formatearPrecio(pedidoSeleccionado.subtotal)}</span>
              </div>
            </div>

            {/* ========== ACCIONES DE ESTADO ========== */}
            <div className="space-y-3 pt-2">
              {pedidoSeleccionado.estado === 'PENDIENTE' && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => cambiarEstado(pedidoSeleccionado.id, 'CONFIRMADO')}
                    className="flex-1 bg-[#e8621a] hover:bg-orange-600 text-white font-serif font-bold py-3.5 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5"
                  >
                    ✓ Confirmar Pedido
                  </button>
                  <button
                    onClick={() => {
                      const razon = prompt('Indica el motivo del rechazo:')
                      if (razon) {
                        pedidosService.rechazar(pedidoSeleccionado.id, { razon })
                        .then(() => {
                          setAlert({ type: 'success', message: 'Pedido rechazado' })
                          cargarPedidos()
                          setPedidoSeleccionado(prev => ({ ...prev, estado: 'RECHAZADO', razon_rechazo: razon }))
                        })
                        .catch((error) => {
                          const msg = error.response?.data?.message || 'Error al rechazar';
                          setAlert({ type: 'error', message: msg });
                        })
                      }
                    }}
                    className="flex-1 bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 font-semibold py-3.5 rounded-xl transition-all"
                  >
                    ✗ Rechazar
                  </button>
                </div>
              )}

              {pedidoSeleccionado.estado === 'CONFIRMADO' && (
                <button
                  onClick={() => cambiarEstado(pedidoSeleccionado.id, 'PREPARANDO')}
                  className="w-full bg-[#e8621a] hover:bg-orange-600 text-white font-serif font-bold py-3.5 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5"
                >
                  👨‍🍳 Comenzar Preparación
                </button>
              )}

              {pedidoSeleccionado.estado === 'PREPARANDO' && (
                <button
                  onClick={() => cambiarEstado(pedidoSeleccionado.id, 'LISTO')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-serif font-bold py-3.5 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5"
                >
                  📦 Marcar como Listo
                </button>
              )}

              {pedidoSeleccionado.estado === 'LISTO' && (
                <div className="space-y-3">
                  {pedidoSeleccionado.metodo_pago === 'EFECTIVO' && !pedidoSeleccionado.pago_efectivo_recibido && (
                    <button
                      onClick={() => {
                        pedidosService.confirmarPagoEfectivo(pedidoSeleccionado.id)
                        .then(() => {
                          setAlert({ type: 'success', message: 'Pago confirmado' })
                          cargarPedidos()
                          setPedidoSeleccionado(prev => ({ ...prev, pago_efectivo_recibido: true }))
                        })
                        .catch((error) => {
                          const msg = error.response?.data?.message || 'Error';
                          setAlert({ type: 'error', message: msg });
                        })
                      }}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-serif font-bold py-3.5 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5"
                    >
                      💰 Confirmar Pago Efectivo
                    </button>
                  )}
                  <button
                    onClick={() => cambiarEstado(pedidoSeleccionado.id, 'EN_CAMINO')}
                    className="w-full bg-[#e8621a] hover:bg-orange-600 text-white font-serif font-bold py-3.5 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5"
                  >
                    🛵 Enviar Pedido
                  </button>
                </div>
              )}

              {pedidoSeleccionado.estado === 'EN_CAMINO' && (
                <button
                  onClick={() => cambiarEstado(pedidoSeleccionado.id, 'ENTREGADO')}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-serif font-bold py-3.5 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5"
                >
                  ✅ Marcar Entregado
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
import { useState, useEffect } from 'react'
import { dashboardService } from '../../services/dashboardService'
import { ShoppingCart, ChefHat, Package, Truck, TrendingUp, DollarSign, Clock } from 'lucide-react'
import Loading from '../../components/shared/Loading'
import Alert from '../../components/shared/Alert'

// 🇨🇴 Componente de Reloj en Vivo para Colombia
function RelojColombia() {
  const [horaActual, setHoraActual] = useState('')

  useEffect(() => {
    const actualizarReloj = () => {
      const ahora = new Date()
      const horaFormateada = ahora.toLocaleTimeString('es-CO', {
        timeZone: 'America/Bogota',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      })
      setHoraActual(horaFormateada)
    }

    actualizarReloj()
    const intervalo = setInterval(actualizarReloj, 1000)
    return () => clearInterval(intervalo)
  }, [])

  return (
    <div className="flex items-center gap-2 bg-[#1a1209] border border-[#3a2a18] px-3.5 py-2 rounded-xl text-[#f5ead8] shadow-inner text-sm font-mono">
      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
      <Clock size={15} className="text-[#e8621a]" />
      <span className="text-[10px] sm:text-xs text-[#9c8a6e] uppercase tracking-wider font-sans font-semibold">Colombia:</span>
      <strong className="text-[#f0a030] text-xs sm:text-sm">{horaActual}</strong>
    </div>
  )
}

export default function DashboardPage() {
  const [resumen, setResumen] = useState(null)
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    cargarResumen()
    
    const interval = setInterval(cargarResumen, 15000) 

    const handleFocus = () => cargarResumen()
    window.addEventListener('focus', handleFocus)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const cargarResumen = async () => {
    try {
      const res = await dashboardService.obtenerResumen()
      setResumen(res.data)
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Error cargando dashboard'
      })
    } finally {
      setLoading(false)
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

  const formatearHoraColombia = (fechaIso) => {
    if (!fechaIso) return 'N/A';
    
    let fechaStr = fechaIso;
    if (typeof fechaIso === 'string') {
      if (!fechaIso.endsWith('Z') && !fechaIso.includes('+')) {
        fechaStr = fechaIso + 'Z';
      }
    }

    const fecha = new Date(fechaStr);
    if (isNaN(fecha.getTime())) return 'Hora inválida';

    return fecha.toLocaleTimeString('es-CO', {
      timeZone: 'America/Bogota',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  if (loading) return <Loading />

  const estadisticas = [
    {
      label: 'Pendientes',
      valor: resumen?.resumen?.pendientes || 0,
      icon: ShoppingCart,
      color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    },
    {
      label: 'En Preparación',
      valor: resumen?.resumen?.en_preparacion || 0,
      icon: ChefHat,
      color: 'bg-orange-500/10 text-[#e8621a] border-orange-500/20',
    },
    {
      label: 'Listos',
      valor: resumen?.resumen?.listos || 0,
      icon: Package,
      color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    },
    {
      label: 'En Camino',
      valor: resumen?.resumen?.en_camino || 0,
      icon: Truck,
      color: 'bg-green-500/10 text-green-400 border-green-500/20',
    },
  ]

  return (
    <div className="space-y-6 sm:space-y-8 text-[#f5ead8] animate-fade-in pb-12">
      
      {/* ========== HEADER ========== */}
      <div className="bg-[#231a0d] border border-[#3a2a18] p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#f5ead8] flex items-center gap-2">
            📊 Dashboard en Vivo
          </h1>
          <p className="text-xs sm:text-sm text-[#9c8a6e] mt-1">Resumen general y métricas de hoy en tiempo real (Hora Colombia).</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="bg-[#1a1209] border border-[#3a2a18] px-3 py-2 rounded-xl text-xs text-[#f0a030] font-semibold flex items-center gap-2 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
            En tiempo real
          </div>
          <RelojColombia />
        </div>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} />}

      {/* ========== TARJETAS DE ESTADÍSTICAS ========== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {estadisticas.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className="bg-[#231a0d] border border-[#3a2a18] rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-md hover:border-[#e8621a]/50 transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#9c8a6e] text-[10px] sm:text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                  <p className="text-3xl sm:text-4xl font-serif font-extrabold text-[#f5ead8] mt-2 group-hover:text-[#f0a030] transition">{stat.valor}</p>
                </div>
                <div className={`${stat.color} border p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-inner group-hover:shadow-md transition`}>
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ========== RESUMEN DE HOY ========== */}
      <div className="bg-[#231a0d] border border-[#3a2a18] rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-md">
        <div className="border-b border-[#3a2a18] pb-3 sm:pb-4 mb-4 sm:mb-6 flex items-center gap-2">
          <DollarSign className="text-[#f0a030] w-5 h-5 sm:w-6 sm:h-6" />
          <h2 className="text-lg sm:text-xl font-serif font-bold text-[#f5ead8]">Resumen de Hoy</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Ingresos */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1209] to-[#231a0d] border border-[#3a2a18] p-5 sm:p-6 rounded-2xl flex items-center gap-4 sm:gap-5 shadow-sm hover:border-[#f0a030]/50 transition">
            <div className="bg-[#f0a030]/10 border border-[#f0a030]/20 text-[#f0a030] p-4 sm:p-5 rounded-xl shrink-0">
              <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <p className="text-[#9c8a6e] text-[10px] sm:text-xs uppercase font-bold tracking-widest mb-1">Ingresos del Día</p>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-[#f0a030]">
                {formatearPrecio(resumen?.ventas_hoy?.total || 0)}
              </p>
            </div>
          </div>

          {/* Pedidos */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1209] to-[#231a0d] border border-[#3a2a18] p-5 sm:p-6 rounded-2xl flex items-center gap-4 sm:gap-5 shadow-sm hover:border-[#e8621a]/50 transition">
            <div className="bg-[#e8621a]/10 border border-[#e8621a]/20 text-[#e8621a] p-4 sm:p-5 rounded-xl shrink-0">
              <Package className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <p className="text-[#9c8a6e] text-[10px] sm:text-xs uppercase font-bold tracking-widest mb-1">Pedidos Despachados</p>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-[#e8621a]">
                {resumen?.ventas_hoy?.cantidad_pedidos || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========== ÚLTIMOS PEDIDOS ========== */}
      <div className="bg-[#231a0d] border border-[#3a2a18] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-md">
        <div className="border-b border-[#3a2a18] pb-3 sm:pb-4 mb-4 sm:mb-6 flex items-center gap-2">
          <Clock className="text-[#f0a030] w-5 h-5 sm:w-6 sm:h-6" />
          <h2 className="text-lg sm:text-xl font-serif font-bold text-[#f5ead8]">Últimos Pedidos</h2>
        </div>

        <div className="overflow-x-auto pb-2">
          <table className="w-full text-sm text-left min-w-[600px]">
            <thead>
              <tr className="border-b border-[#3a2a18] text-[#9c8a6e] text-[10px] sm:text-xs uppercase tracking-wider">
                <th className="py-3 px-4">Pedido</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Hora (CO)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3a2a18]/50">
              {resumen?.ultimos_pedidos && resumen.ultimos_pedidos.length > 0 ? (
                resumen.ultimos_pedidos.map(pedido => (
                  <tr key={pedido.id} className="hover:bg-[#1a1209]/60 transition-colors">
                    <td className="py-4 px-4 font-serif font-bold text-[#f0a030]">#{pedido.numero_pedido}</td>
                    <td className="py-4 px-4 text-[#f5ead8] font-medium truncate">{pedido.cliente?.nombre || 'Cliente'}</td>
                    <td className="py-4 px-4 font-bold text-[#f5ead8]">{formatearPrecio(pedido.subtotal || pedido.total)}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border inline-block ${
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
                    <td className="py-4 px-4 text-[#9c8a6e] text-xs">
                      {formatearHoraColombia(pedido.created_at)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-[#9c8a6e]">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p className="font-serif text-base">No hay pedidos registrados aún</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
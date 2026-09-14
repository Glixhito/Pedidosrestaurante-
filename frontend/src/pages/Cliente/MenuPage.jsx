import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { io } from 'socket.io-client'
import { productosService } from '../../services/productosService'
import { categoriasService } from '../../services/categoriasService'
import { useCarritoStore } from '../../store/carritoStore'
import Loading from '../../components/shared/Loading'
import { ShoppingBag, Flame, Plus, Minus, X, ChevronRight, Utensils, Search, Check } from 'lucide-react'

// ⚡ Conexión dinámica inteligente
const getSocketUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) {
    return apiUrl.replace(/\/api\/?$/, '');
  }
  return 'https://servicios-de-restaurante.onrender.com';
};

const socket = io(getSocketUrl(), {
  transports: ['websocket', 'polling'],
})

export default function MenuPage() {
  const [categorias, setCategorias] = useState([])
  const [productos, setProductos] = useState([])
  const [categoriaActual, setCategoriaActual] = useState('todos')
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState(null)
  const [modalQty, setModalQty] = useState(1)
  const [porcionSeleccionada, setPorcionSeleccionada] = useState(null)
  const [adicionesSeleccionadas, setAdicionesSeleccionadas] = useState([])

  const { agregarProducto, obtenerCantidadTotal, obtenerSubtotal } = useCarritoStore()

  useEffect(() => {
    cargarDatos()

    socket.on('menu_actualizado', () => {
      console.log('⚡ ¡Actualización detectada en el menú!')
      cargarDatos()
    })

    return () => {
      socket.off('menu_actualizado')
    }
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)

      let categoriasData = []
      try {
        const catRes = await categoriasService.obtenerParaCliente()
        categoriasData = Array.isArray(catRes.data) 
          ? catRes.data 
          : (catRes.data?.categorias || catRes.data?.data || [])
      } catch (err) {
        console.warn('Aviso: No se pudieron cargar las categorías', err)
      }

      let productosData = []
      try {
        const prodRes = await productosService.obtenerMenu()
        productosData = Array.isArray(prodRes.data) 
          ? prodRes.data 
          : (prodRes.data?.productos || prodRes.data?.data || [])
      } catch (err) {
        console.warn('Aviso: No se pudieron cargar los productos', err)
      }

      setCategorias(categoriasData)
      setProductos(productosData)
    } catch (error) {
      console.error('Error general cargando menú:', error)
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

  const productosFiltrados = categoriaActual === 'todos'
    ? productos
    : productos.filter(p => {
        const catIdProducto = p.categoria_id || p.categoria?.id || p.categoria;
        return String(catIdProducto) === String(categoriaActual);
      })

  const openDetail = (item) => {
    setSelectedItem(item)
    setModalQty(1)
    setAdicionesSeleccionadas([])
    
    if (item.porciones && item.porciones.length > 0) {
      setPorcionSeleccionada(item.porciones[0])
    } else {
      setPorcionSeleccionada(null)
    }
  }

  const closeDetail = () => {
    setSelectedItem(null)
    setModalQty(1)
    setPorcionSeleccionada(null)
    setAdicionesSeleccionadas([])
  }

  const toggleAdicion = (adicion) => {
    setAdicionesSeleccionadas(prev => {
      const existe = prev.find(a => a.id === adicion.id);
      if (existe) {
        return prev.filter(a => a.id !== adicion.id);
      } else {
        return [...prev, adicion];
      }
    });
  }

  const addFromModal = () => {
    if (selectedItem) {
      if (selectedItem.porciones && selectedItem.porciones.length > 0 && !porcionSeleccionada) {
        alert('Por favor selecciona un gramaje')
        return
      }
      agregarProducto(selectedItem, porcionSeleccionada, adicionesSeleccionadas, modalQty)
      closeDetail()
    }
  }

  const precioBaseModal = selectedItem 
    ? (porcionSeleccionada ? Number(porcionSeleccionada.precio) : Number(selectedItem.precio))
    : 0;
  
  const totalAdicionesModal = adicionesSeleccionadas.reduce((sum, ad) => sum + Number(ad.precio), 0);
  const precioUnitarioTotal = precioBaseModal + totalAdicionesModal;

  if (loading) return <Loading />

  return (
    <div className="min-h-screen bg-[#1a1209] text-[#f5ead8] font-sans relative pb-28">
      
      {/* ============ HEADER ADAPTATIVO ============ */}
      <div className="sticky top-0 z-30 bg-[#1a1209]/95 backdrop-blur border-b border-[#3a2a18] px-6 py-4 flex justify-between items-center max-w-7xl mx-auto shadow-md">
        <div>
          <span className="text-xs text-[#f0a030] uppercase tracking-widest font-bold">Asadero Parrilla</span>
          <h1 className="text-xl sm:text-2xl font-serif text-[#f5ead8]">Punto de Encuentro</h1>
        </div>
        
        <div className="flex items-center gap-2.5">
          <Link 
            to="/rastrear" 
            className="bg-[#231a0d] border border-[#3a2a18] hover:border-[#e8621a]/50 text-[#f5ead8] px-3.5 py-2.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
          >
            <Search size={16} className="text-[#e8621a]" />
            <span className="hidden sm:inline">Rastrear</span>
          </Link>

          <Link to="/carrito" className="relative bg-[#231a0d] border border-[#3a2a18] px-3.5 py-2.5 rounded-xl text-[#f0a030] hover:bg-[#2e2010] transition flex items-center gap-2 shadow-inner">
            <ShoppingBag size={18} />
            <span className="hidden sm:inline text-xs font-bold">Carrito</span>
            {obtenerCantidadTotal() > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#e8621a] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                {obtenerCantidadTotal()}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* ============ HERO BANNER ============ */}
        <div className="relative rounded-3xl overflow-hidden border border-[#3a2a18] bg-[#231a0d] h-56 md:h-72 shadow-2xl">
          <img 
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=600&fit=crop&auto=format" 
            alt="Parrilla" 
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1209] via-transparent to-transparent flex flex-col justify-end p-6 md:p-10">
            <span className="bg-[#e8621a] text-white text-xs font-bold px-3 py-1 rounded-full w-fit uppercase tracking-wider mb-2 flex items-center gap-1.5 shadow">
              <Flame size={14} /> Fuego en Vivo
            </span>
            <h2 className="text-3xl md:text-5xl font-serif text-[#f5ead8] font-extrabold">Cortes al Carbón</h2>
            <p className="text-sm md:text-base text-[#9c8a6e] mt-1">El verdadero sabor artesanal en tu mesa.</p>
          </div>
        </div>

        {/* ============ TABS DE CATEGORÍAS ============ */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setCategoriaActual('todos')}
            className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all border shadow-sm flex items-center gap-2 shrink-0 ${
              categoriaActual === 'todos'
                ? 'bg-[#e8621a] text-white border-[#e8621a] shadow-[0_0_12px_rgba(232,98,26,0.4)]'
                : 'bg-[#231a0d] text-[#9c8a6e] border-[#3a2a18] hover:text-[#f5ead8]'
            }`}
          >
            <Utensils size={15} /> Todo el Menú
          </button>
          
          {categorias.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoriaActual(cat.id)}
              className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all border shadow-sm shrink-0 ${
                categoriaActual === cat.id
                  ? 'bg-[#e8621a] text-white border-[#e8621a] shadow-[0_0_12px_rgba(232,98,26,0.4)]'
                  : 'bg-[#231a0d] text-[#9c8a6e] border-[#3a2a18] hover:text-[#f5ead8]'
              }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>

        {/* ============ GRID DE PRODUCTOS (MEJORADO) ============ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          
          {productosFiltrados.length === 0 ? (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-center opacity-70 bg-[#231a0d] border border-[#3a2a18] rounded-3xl">
              <Flame size={48} className="text-[#e8621a] mb-4" />
              <p className="text-[#f5ead8] font-serif text-lg font-bold">Pronto encenderemos el fuego aquí.</p>
              <p className="text-sm text-[#9c8a6e] mt-1">Aún no hay platos registrados en esta categoría.</p>
            </div>
          ) : (
            productosFiltrados.map(producto => {
              const tienePorciones = producto.porciones && producto.porciones.length > 0;
              const precioMin = tienePorciones 
                ? Math.min(...producto.porciones.map(p => p.precio))
                : Number(producto.precio);
              
              const badge = tienePorciones 
                ? { text: 'Varias porciones', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' }
                : { text: 'Disponible', color: 'bg-green-500/20 text-green-300 border-green-500/30' };

              return (
                <div 
                  key={producto.id}
                  onClick={() => openDetail(producto)}
                  className="bg-[#231a0d] border border-[#3a2a18] rounded-2xl overflow-hidden cursor-pointer hover:border-[#e8621a] transition-all duration-300 group flex flex-col shadow-lg hover:shadow-[0_8px_32px_rgba(232,98,26,0.2)] transform hover:-translate-y-1"
                >
                  {/* ========== IMAGEN CON OVERLAY ========== */}
                  <div className="relative h-56 overflow-hidden bg-[#1a1209]">
                    <img
                      src={producto.imagen_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700&h=500&fit=crop&auto=format"}
                      alt={producto.nombre}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    />
                    
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60 group-hover:via-black/40 transition duration-300" />
                    
                    {/* Badges en esquina superior derecha */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                      <div className="bg-[#e8621a] text-white font-bold text-sm px-3 py-1.5 rounded-lg shadow-lg backdrop-blur-sm border border-orange-400/50">
                        {tienePorciones ? 'Desde ' : ''}{formatearPrecio(precioMin)}
                      </div>
                      <div className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${badge.color} backdrop-blur-sm`}>
                        {badge.text}
                      </div>
                    </div>

                    {/* CTA flotante en hover */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#1a1209] to-transparent opacity-0 group-hover:opacity-100 transition duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <button className="w-full bg-[#e8621a] hover:bg-orange-600 text-white font-bold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 shadow-lg">
                        <Plus size={16} /> Ver Detalles
                      </button>
                    </div>
                  </div>

                  {/* ========== CONTENIDO ========== */}
                  <div className="p-5 flex flex-col flex-1 space-y-3">
                    {/* Nombre y descripción */}
                    <div>
                      <h3 className="font-serif font-bold text-lg text-[#f5ead8] group-hover:text-[#f0a030] transition line-clamp-2">
                        {producto.nombre}
                      </h3>
                      <p className="text-xs text-[#9c8a6e] line-clamp-2 mt-2 leading-relaxed">
                        {producto.descripcion || 'Especialidad de la casa al carbón.'}
                      </p>
                    </div>

                    {/* Características de porciones */}
                    {tienePorciones && (
                      <div className="flex flex-wrap gap-1.5">
                        {producto.porciones.slice(0, 2).map(p => (
                          <span key={p.id} className="text-[10px] font-semibold bg-[#2e2010] text-[#f0a030] px-2 py-1 rounded border border-[#3a2a18]">
                            {p.gramos}g
                          </span>
                        ))}
                        {producto.porciones.length > 2 && (
                          <span className="text-[10px] font-semibold bg-[#2e2010] text-[#9c8a6e] px-2 py-1 rounded border border-[#3a2a18]">
                            +{producto.porciones.length - 2}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Adiciones disponibles */}
                    {producto.adiciones && producto.adiciones.length > 0 && (
                      <div className="flex items-center gap-1.5 text-[11px] text-amber-300/80">
                        <span className="text-sm">🧀</span>
                        <span className="font-medium">{producto.adiciones.length} adiciones disponibles</span>
                      </div>
                    )}
                  </div>

                  {/* ========== PIE ========== */}
                  <div className="border-t border-[#3a2a18] p-4 flex items-center justify-between bg-[#1a1209]/50">
                    <div>
                      <p className="text-[10px] text-[#9c8a6e] uppercase font-bold tracking-wider">
                        {tienePorciones ? 'Desde' : 'Precio'}
                      </p>
                      <p className="text-[#f0a030] font-serif font-bold text-base">
                        {formatearPrecio(precioMin)}
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-[#e8621a] rounded-full flex items-center justify-center text-white group-hover:scale-110 group-hover:shadow-lg transition">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* ============ BARRA FLOTANTE CARRITO ============ */}
      {obtenerCantidadTotal() > 0 && (
        <div className="fixed bottom-6 left-4 right-4 max-w-md mx-auto z-40">
          <Link to="/carrito" className="bg-[#e8621a] text-white p-4 rounded-2xl flex justify-between items-center border border-orange-400 shadow-[0_10px_40px_rgba(232,98,26,0.35)] hover:bg-orange-600 hover:shadow-[0_10px_50px_rgba(232,98,26,0.5)] transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center gap-3">
              <span className="bg-orange-700 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-inner">
                {obtenerCantidadTotal()}
              </span>
              <span className="font-serif font-bold text-sm">Ver Carrito</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">{formatearPrecio(obtenerSubtotal())}</span>
              <ChevronRight size={18} />
            </div>
          </Link>
        </div>
      )}

      {/* ============ MODAL DE DETALLE (MEJORADO) ============ */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#231a0d] border border-[#3a2a18] w-full max-w-lg rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={closeDetail} className="absolute top-4 right-4 bg-[#2e2010] p-2.5 rounded-full text-[#9c8a6e] hover:text-white hover:bg-[#e8621a] transition-all">
              <X size={20} />
            </button>

            <img
              src={selectedItem.imagen_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700&h=500&fit=crop&auto=format"}
              alt={selectedItem.nombre}
              className="w-full h-48 md:h-60 rounded-2xl object-cover border border-[#3a2a18]"
            />

            <div>
              <h2 className="text-xl md:text-2xl font-serif font-bold text-[#f5ead8]">{selectedItem.nombre}</h2>
              <p className="text-xs md:text-sm text-[#9c8a6e] leading-relaxed mt-2">{selectedItem.descripcion || 'Preparado al carbón con los mejores cortes y sazón artesanal.'}</p>
            </div>

            {/* ========== SELECTOR DE GRAMAJES (MEJORADO) ========== */}
            {selectedItem.porciones && selectedItem.porciones.length > 0 && (
              <div className="space-y-3 bg-gradient-to-br from-[#1a1209] to-[#140e06] p-5 rounded-2xl border border-[#3a2a18] shadow-inner">
                <div className="flex items-center gap-2 mb-3">
                  <Utensils size={16} className="text-[#f0a030]" />
                  <label className="text-xs font-bold text-[#f0a030] uppercase tracking-widest">
                    Elige el Gramaje
                  </label>
                  <span className="ml-auto text-[11px] text-[#9c8a6e]">
                    {selectedItem.porciones.length} opciones
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-2.5">
                  {selectedItem.porciones.map((porcion) => (
                    <button
                      key={porcion.id}
                      type="button"
                      onClick={() => setPorcionSeleccionada(porcion)}
                      className={`py-3.5 px-3 rounded-xl text-xs font-bold border-2 transition-all duration-200 flex flex-col items-center gap-1.5 transform ${
                        porcionSeleccionada?.id === porcion.id
                          ? 'bg-[#e8621a] text-white border-[#e8621a] shadow-[0_0_16px_rgba(232,98,26,0.4)] scale-105'
                          : 'bg-[#231a0d] text-[#9c8a6e] border-[#3a2a18] hover:border-[#e8621a]/60 hover:bg-[#2e2010]'
                      }`}
                    >
                      <span className="text-sm font-extrabold">{porcion.gramos}</span>
                      <span className="text-[10px] opacity-90 font-semibold">
                        {formatearPrecio(porcion.precio)}
                      </span>
                      {porcionSeleccionada?.id === porcion.id && (
                        <Check size={12} className="mt-0.5" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ========== SELECTOR DE ADICIONES (MEJORADO) ========== */}
            {selectedItem.adiciones && selectedItem.adiciones.length > 0 && (
              <div className="space-y-3 bg-gradient-to-br from-[#1a1209] to-[#140e06] p-5 rounded-2xl border border-[#3a2a18] shadow-inner">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🧀</span>
                  <label className="text-xs font-bold text-[#f0a030] uppercase tracking-widest">
                    Personaliza tu Orden
                  </label>
                  <span className="ml-auto text-[11px] text-[#9c8a6e]">
                    {adicionesSeleccionadas.length} seleccionadas
                  </span>
                </div>
                
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {selectedItem.adiciones.map((adicion) => {
                    const seleccionada = adicionesSeleccionadas.some(a => a.id === adicion.id);
                    return (
                      <label
                        key={adicion.id}
                        onClick={() => toggleAdicion(adicion)}
                        className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-150 transform ${
                          seleccionada
                            ? 'bg-[#e8621a]/15 border-[#e8621a] shadow-[0_0_12px_rgba(232,98,26,0.2)]'
                            : 'bg-[#231a0d] border-[#3a2a18] hover:border-[#e8621a]/40 hover:bg-[#2e2010]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                            seleccionada 
                              ? 'bg-[#e8621a] border-[#e8621a] shadow-sm' 
                              : 'border-[#9c8a6e]/30 bg-[#1a1209]'
                          }`}>
                            {seleccionada && <Check size={14} className="text-white font-bold" />}
                          </div>
                          <span className={`text-sm font-semibold transition-colors ${
                            seleccionada ? 'text-[#f5ead8]' : 'text-[#9c8a6e]'
                          }`}>
                            {adicion.nombre}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-[#f0a030]">
                          +{formatearPrecio(adicion.precio)}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center border-t border-b border-[#3a2a18] py-4">
              <span className="text-xs text-[#9c8a6e]">Precio unitario (con adiciones)</span>
              <span className="text-xl font-bold text-[#f0a030]">{formatearPrecio(precioUnitarioTotal)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-[#f5ead8]">Cantidad</span>
              <div className="flex items-center gap-4 bg-[#1a1209] border border-[#3a2a18] px-4 py-2 rounded-xl shadow-inner">
                <button onClick={() => setModalQty(Math.max(1, modalQty - 1))} className="text-[#9c8a6e] hover:text-[#e8621a] transition">
                  <Minus size={18} />
                </button>
                <span className="font-bold text-base w-6 text-center">{modalQty}</span>
                <button onClick={() => setModalQty(modalQty + 1)} className="text-[#9c8a6e] hover:text-[#e8621a] transition">
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <button
              onClick={addFromModal}
              className="w-full bg-[#e8621a] hover:bg-orange-600 text-white font-serif font-bold py-4 rounded-2xl shadow-xl transition flex justify-between px-6 text-base items-center transform hover:-translate-y-1 active:translate-y-0"
            >
              <span>Agregar al Pedido</span>
              <span>{formatearPrecio(precioUnitarioTotal * modalQty)}</span>
            </button>
          </div>
        </div>
      )}

      {/* ========== ESTILOS GLOBALES ========== */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #140e06;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #3a2a18;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #e8621a;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
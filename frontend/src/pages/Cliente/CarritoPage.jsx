import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, Trash2, Plus, Minus, ChevronLeft, ArrowRight, Utensils } from 'lucide-react'
import { useCarritoStore } from '../../store/carritoStore'

export default function CarritoPage() {
  const { items, actualizarCantidad, removerProducto, obtenerSubtotal } = useCarritoStore()
  const navigate = useNavigate()
  
  const subtotal = Number(obtenerSubtotal()) || 0

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

  // ========== ESTADO: CARRITO VACÍO ==========
  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto bg-[#1a1209] min-h-screen text-[#f5ead8] p-6 flex flex-col items-center justify-center text-center">
        <div className="bg-[#231a0d] border border-[#3a2a18] p-6 rounded-3xl mb-6 shadow-[0_0_30px_rgba(232,98,26,0.15)]">
          <ShoppingBag size={48} className="text-[#e8621a] mx-auto opacity-90" />
        </div>
        <h2 className="text-2xl font-serif font-bold mb-2">Tu carrito está vacío</h2>
        <p className="text-sm text-[#9c8a6e] mb-8 px-4">Añade los mejores cortes y platos de la parrilla para continuar.</p>
        <Link to="/" className="w-full bg-[#e8621a] text-white font-serif font-bold py-4 rounded-xl shadow-[0_5px_20px_rgba(232,98,26,0.3)] hover:bg-orange-600 transition-all duration-300 block transform hover:-translate-y-1">
          Ver Menú al Carbón
        </Link>
      </div>
    )
  }

  // ========== ESTADO: CARRITO CON PRODUCTOS ==========
  return (
    <div className="max-w-md mx-auto bg-[#1a1209] min-h-screen text-[#f5ead8] font-sans p-5 pb-40 relative">
      
      {/* ========== HEADER ==========  */}
      <div className="flex items-center justify-between mb-6 border-b border-[#3a2a18] pb-4">
        <Link to="/" className="bg-[#231a0d] border border-[#3a2a18] p-2 rounded-xl text-[#9c8a6e] hover:text-white hover:bg-[#2e2010] transition">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="font-serif font-bold text-lg tracking-wide">Tu Pedido Actual</h1>
        <div className="w-9"></div>
      </div>
      
      {/* ========== LISTA DE PRODUCTOS ==========  */}
      <div className="space-y-4 mb-8">
        {items.map(item => {
          const uniqueId = item.cartItemId || item.id;

          return (
            <div 
              key={uniqueId} 
              className="bg-[#231a0d] border border-[#3a2a18] rounded-2xl p-4 flex gap-4 shadow-[0_4px_15px_rgba(0,0,0,0.15)] transition-all hover:border-[#e8621a]/40 hover:shadow-[0_6px_20px_rgba(232,98,26,0.15)]"
            >
              {/* ========== IMAGEN ==========  */}
              <img 
                src={item.imagen_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700&h=500&fit=crop&auto=format"} 
                alt={item.nombre} 
                className="w-20 h-20 rounded-xl object-cover border border-[#3a2a18] shrink-0" 
              />
              
              {/* ========== CONTENIDO ==========  */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                
                {/* Nombre */}
                <div>
                  <h3 className="font-serif font-bold text-[15px] text-[#f5ead8] leading-tight line-clamp-2">
                    {item.nombre}
                  </h3>

                  {/* Gramaje */}
                  {item.gramos && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#f0a030] bg-[#f0a030]/10 px-2 py-0.5 rounded-md mt-1.5 border border-[#f0a030]/20">
                      <Utensils size={12} />
                      {item.gramos}g
                    </span>
                  )}

                  {/* Adiciones */}
                  {item.adiciones && item.adiciones.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-[#3a2a18]/50 space-y-1">
                      {item.adiciones.map((adicion, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                          <span className="text-amber-400 font-bold">+</span>
                          <span className="text-amber-200/70 font-medium">{adicion.nombre}</span>
                          <span className="text-amber-300/60 text-[10px]">
                            ({formatearPrecio(adicion.precio)})
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Precio total del item */}
                <p className="text-sm text-[#f0a030] font-bold mt-2">
                  {formatearPrecio(item.precio * item.cantidad)}
                </p>
              </div>

              {/* ========== CONTROLES ==========  */}
              <div className="flex flex-col items-end justify-between">
                <button 
                  onClick={() => removerProducto(uniqueId)} 
                  className="text-red-400 bg-red-400/10 hover:bg-red-500 hover:text-white p-2 rounded-lg transition-all shadow-sm"
                >
                  <Trash2 size={18} />
                </button>
                
                <div className="flex items-center gap-2 bg-[#1a1209] border border-[#3a2a18] px-2 py-1.5 rounded-lg shadow-inner">
                  <button 
                    onClick={() => actualizarCantidad(uniqueId, item.cantidad - 1)} 
                    className="text-[#9c8a6e] hover:text-[#e8621a] transition-colors p-1"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-sm font-bold w-5 text-center">{item.cantidad}</span>
                  <button 
                    onClick={() => actualizarCantidad(uniqueId, item.cantidad + 1)} 
                    className="text-[#9c8a6e] hover:text-[#e8621a] transition-colors p-1"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========== FOOTER CON TOTAL Y CTA ==========  */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#231a0d]/95 backdrop-blur-md border-t border-[#3a2a18] p-5 space-y-4 shadow-[0_-15px_40px_rgba(0,0,0,0.6)] z-50 rounded-t-3xl">
        
        {/* Subtotal */}
        <div className="flex justify-between items-center text-sm px-1">
          <span className="text-[#9c8a6e] font-medium">Subtotal platos</span>
          <span className="font-bold text-[#f5ead8]">{formatearPrecio(subtotal)}</span>
        </div>
        
        {/* Total estimado */}
        <div className="flex justify-between items-end border-t border-[#3a2a18] pt-3 px-1">
          <span className="font-bold text-base text-[#f5ead8]">
            Total estimado
            <br/>
            <span className="text-[11px] text-[#9c8a6e] font-normal">(Sin domicilio)</span>
          </span>
          <span className="text-[#f0a030] text-2xl font-serif font-bold">{formatearPrecio(subtotal)}</span>
        </div>
        
        {/* Botón continuar */}
        <button 
          onClick={() => navigate('/checkout')} 
          className="w-full bg-[#e8621a] hover:bg-orange-600 text-white font-serif font-bold py-4 rounded-xl shadow-[0_5px_20px_rgba(232,98,26,0.3)] transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-1 active:translate-y-0"
        >
          <span className="tracking-wide">Continuar a Entrega y Pago</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}
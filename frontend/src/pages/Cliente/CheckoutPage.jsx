import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCarritoStore } from '../../store/carritoStore'
import { pedidosService } from '../../services/pedidosService'
import Alert from '../../components/shared/Alert'
import { ChevronLeft, MapPin, User, CreditCard, CheckCircle, Info } from 'lucide-react'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, obtenerSubtotal, limpiarCarrito } = useCarritoStore()
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState(null)

  const [formData, setFormData] = useState({
    cliente: { nombre: '', telefono: '' },
    entrega: { direccion: '', referencia: '', instrucciones: '' },
    pago: { metodo: 'EFECTIVO' },
  })

  const isFormValid = 
    formData.cliente.nombre.trim() !== '' &&
    formData.cliente.telefono.trim() !== '' &&
    formData.entrega.direccion.trim() !== '';

  const subtotal = Number(obtenerSubtotal()) || 0;
  const total = subtotal;

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!isFormValid) {
      setAlert({ type: 'error', message: 'Por favor completa todos los campos obligatorios.' })
      return
    }

    try {
      setLoading(true)
      
      // 🥩 PAYLOAD CORREGIDO: Mapeando porción y adiciones correctamente
      const datos = {
        ...formData,
        carrito: items.map(item => ({
          producto_id: item.producto_id || item.id,
          porcion_id: item.porcion ? item.porcion.id : null,
          cantidad: item.cantidad,
          adiciones: item.adiciones ? item.adiciones.map(ad => ({ id: ad.id, precio: ad.precio })) : []
        })),
      }
      
      const res = await pedidosService.crear(datos)
      const pedidoCreado = res.data.pedido; 
      limpiarCarrito()
      
      if (formData.pago.metodo === 'NEQUI') {
        const telefonoAdmin = '573159276048'; // ⚠️ Tu número de WhatsApp
        
        let texto = `*¡Hola! Acabo de hacer un pedido (#${pedidoCreado.numero_pedido})* 🍔\n\n`;
        texto += `👤 *Cliente:* ${formData.cliente.nombre}\n`;
        texto += `📍 *Dirección:* ${formData.entrega.direccion}\n`;
        if (formData.entrega.referencia) {
          texto += `🏡 *Referencia:* ${formData.entrega.referencia}\n`;
        }
        texto += `💰 *Total en productos:* ${formatearPrecio(total)}\n`;
        texto += `🛵 *(El domicilio se paga en efectivo al recibir)*\n\n`;
        texto += `Adjunto mi comprobante de transferencia. ¡Quedo atento!`;

        const urlWhatsApp = `https://wa.me/${telefonoAdmin}?text=${encodeURIComponent(texto)}`;
        window.location.href = urlWhatsApp;
      } else {
        navigate('/rastrear?numero=' + pedidoCreado.numero_pedido);
      }

    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.message || 'Error al procesar el pedido' })
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto bg-[#1a1209] min-h-screen text-[#f5ead8] p-6 text-center flex flex-col justify-center">
        <h2 className="text-xl font-serif font-bold mb-4">Tu carrito está vacío</h2>
        <Link to="/" className="bg-[#e8621a] text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition shadow-lg">Volver al Menú</Link>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto bg-[#1a1209] min-h-screen text-[#f5ead8] font-sans p-5 pb-36">
      <div className="flex items-center justify-between mb-6 border-b border-[#3a2a18] pb-4">
        <Link to="/carrito" className="bg-[#231a0d] border border-[#3a2a18] p-2 rounded-xl text-[#9c8a6e] hover:text-white hover:bg-[#2e2010] transition"><ChevronLeft size={20} /></Link>
        <h1 className="font-serif font-bold text-lg tracking-wide">Checkout y Pago</h1>
        <div className="w-9"></div>
      </div>
      
      {alert && <div className="mb-4"><Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} /></div>}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* TUS DATOS */}
        <div className="bg-[#231a0d] border border-[#3a2a18] rounded-3xl p-6 space-y-4 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
          <h2 className="font-serif font-bold text-sm text-[#f0a030] flex items-center gap-2 uppercase tracking-wider"><User size={16} /> Tus Datos</h2>
          <input type="text" placeholder="Nombre completo" required value={formData.cliente.nombre} onChange={(e) => setFormData(prev => ({ ...prev, cliente: { ...prev.cliente, nombre: e.target.value } }))} className="w-full bg-[#1a1209] border border-[#3a2a18] rounded-xl px-4 py-3.5 text-sm text-[#f5ead8] placeholder-[#9c8a6e]/50 focus:outline-none focus:border-[#e8621a] focus:ring-1 focus:ring-[#e8621a] transition-all" />
          <input type="tel" placeholder="Teléfono / WhatsApp" required value={formData.cliente.telefono} onChange={(e) => setFormData(prev => ({ ...prev, cliente: { ...prev.cliente, telefono: e.target.value } }))} className="w-full bg-[#1a1209] border border-[#3a2a18] rounded-xl px-4 py-3.5 text-sm text-[#f5ead8] placeholder-[#9c8a6e]/50 focus:outline-none focus:border-[#e8621a] focus:ring-1 focus:ring-[#e8621a] transition-all" />
        </div>

        {/* DATOS DE ENTREGA */}
        <div className="bg-[#231a0d] border border-[#3a2a18] rounded-3xl p-6 space-y-4 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
          <h2 className="font-serif font-bold text-sm text-[#f0a030] flex items-center gap-2 uppercase tracking-wider"><MapPin size={16} /> Datos de Entrega</h2>
          <input type="text" placeholder="Dirección completa (Ej: Calle 1 # 2-3)" required value={formData.entrega.direccion} onChange={(e) => setFormData(prev => ({ ...prev, entrega: { ...prev.entrega, direccion: e.target.value } }))} className="w-full bg-[#1a1209] border border-[#3a2a18] rounded-xl px-4 py-3.5 text-sm text-[#f5ead8] placeholder-[#9c8a6e]/50 focus:outline-none focus:border-[#e8621a] focus:ring-1 focus:ring-[#e8621a] transition-all" />
          <input type="text" placeholder="Referencia (Ej: Casa roja de dos pisos)" value={formData.entrega.referencia} onChange={(e) => setFormData(prev => ({ ...prev, entrega: { ...prev.entrega, referencia: e.target.value } }))} className="w-full bg-[#1a1209] border border-[#3a2a18] rounded-xl px-4 py-3.5 text-sm text-[#f5ead8] placeholder-[#9c8a6e]/50 focus:outline-none focus:border-[#e8621a] focus:ring-1 focus:ring-[#e8621a] transition-all" />
          
          <div className="bg-[#1a1209] border border-[#e8621a]/30 p-4 rounded-2xl flex items-start gap-3 shadow-inner mt-4">
            <span className="text-[#e8621a] text-xl font-bold mt-0.5">🛵</span>
            <div>
              <h4 className="text-sm font-serif font-bold text-[#f5ead8]">Pago del Domicilio en Casa</h4>
              <p className="text-xs text-[#9c8a6e] mt-1 leading-relaxed">
                El costo del envío se calcula según tu ubicación y se le paga <strong className="text-[#f0a030]">en efectivo al repartidor</strong> al momento de recibir tu pedido.
              </p>
            </div>
          </div>
        </div>

        {/* MÉTODO DE PAGO */}
        <div className="bg-[#231a0d] border border-[#3a2a18] rounded-3xl p-6 space-y-3 shadow-[0_4px_20px_rgba(0,0,0,0.2)] transition-all duration-300">
          <h2 className="font-serif font-bold text-sm text-[#f0a030] flex items-center gap-2 mb-4 uppercase tracking-wider"><CreditCard size={16} /> Método de Pago</h2>
          
          {[
            { value: 'EFECTIVO', label: 'Efectivo contra entrega' }, 
            { value: 'NEQUI', label: 'Transferencia Manual / QR' }
          ].map(metodo => (
            <label key={metodo.value} className={`flex items-center justify-between p-4 bg-[#1a1209] border rounded-xl cursor-pointer transition-all duration-300 ${formData.pago.metodo === metodo.value ? 'border-[#e8621a] bg-[#e8621a]/5 shadow-[0_0_12px_rgba(232,98,26,0.15)]' : 'border-[#3a2a18] hover:border-[#523d26]'}`}>
              <span className={`text-sm font-semibold ${formData.pago.metodo === metodo.value ? 'text-[#e8621a]' : 'text-[#f5ead8]'}`}>{metodo.label}</span>
              <input type="radio" name="pago" value={metodo.value} checked={formData.pago.metodo === metodo.value} onChange={(e) => setFormData(prev => ({ ...prev, pago: { metodo: e.target.value } }))} className="accent-[#e8621a] w-4 h-4 cursor-pointer" />
            </label>
          ))}

          {formData.pago.metodo === 'NEQUI' && (
            <div className="mt-6 p-5 bg-[#140e06]/80 backdrop-blur-sm border border-[#e8621a]/30 rounded-2xl flex flex-col items-center shadow-[0_0_20px_rgba(232,98,26,0.1)] animate-fade-in">
              <div className="w-full mb-5 space-y-3 text-left">
                <div className="flex gap-3 items-start">
                  <span className="bg-[#e8621a] text-white rounded-full w-5 h-5 flex items-center justify-center text-[11px] font-bold mt-0.5 shrink-0 shadow-sm">1</span>
                  <p className="text-[13px] text-[#f5ead8] leading-relaxed">Escanea el QR y transfiere <span className="text-[#f0a030] font-bold text-sm bg-[#f0a030]/10 px-2 py-0.5 rounded border border-[#f0a030]/20">{formatearPrecio(total)}</span></p>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="bg-[#e8621a] text-white rounded-full w-5 h-5 flex items-center justify-center text-[11px] font-bold mt-0.5 shrink-0 shadow-sm">2</span>
                  <p className="text-[13px] text-[#f5ead8] leading-relaxed">Toca el botón <strong>Confirmar y Enviar</strong> al final.</p>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="bg-[#e8621a] text-white rounded-full w-5 h-5 flex items-center justify-center text-[11px] font-bold mt-0.5 shrink-0 shadow-sm">3</span>
                  <p className="text-[13px] text-[#f5ead8] leading-relaxed">Serás redirigido a WhatsApp para enviar el comprobante.</p>
                </div>
              </div>
              
              <div className="bg-white p-3.5 rounded-2xl shadow-[0_0_25px_rgba(232,98,26,0.25)] mb-6 transition-transform hover:scale-105 duration-300">
                <img 
                  src="/img/qr-pago.png" 
                  alt="Código QR de Pago" 
                  className="w-48 h-48 sm:w-52 sm:h-52 object-contain rounded-lg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/200?text=Tu+QR+Aqui";
                  }}
                />
              </div>

              <div className="bg-[#231a0d] border border-[#3a2a18] rounded-xl w-full p-4 flex items-center gap-3 shadow-inner">
                <Info size={22} className="text-[#e8621a] shrink-0" />
                <div>
                  <p className="text-xs text-[#9c8a6e]">¿No puedes escanear?</p>
                  <p className="text-sm text-[#f5ead8] mt-0.5">Transfiere a la llave: <strong className="text-[#f0a030] tracking-wider ml-1">alexp3350</strong></p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER TOTAL Y BOTÓN CONFIRMAR */}
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#231a0d]/95 backdrop-blur-md border-t border-[#3a2a18] p-5 shadow-[0_-15px_40px_rgba(0,0,0,0.6)] z-50 rounded-t-2xl">
          <div className="flex justify-between items-end mb-4">
            <span className="text-sm text-[#9c8a6e] font-medium">Total en Productos<br/><span className="text-xs opacity-70">(Envío no incluido)</span></span>
            <span className="font-serif font-bold text-[#f0a030] text-2xl">{formatearPrecio(total)}</span>
          </div>
          
          {!isFormValid && (
            <p className="text-[#e8621a] text-[11px] text-center mb-3 font-semibold animate-pulse">
              * Completa tus datos personales y dirección para continuar.
            </p>
          )}

          <button 
            type="submit" 
            disabled={!isFormValid || loading} 
            className="w-full bg-[#e8621a] hover:bg-orange-600 text-white font-serif font-bold py-4 rounded-xl shadow-[0_5px_20px_rgba(232,98,26,0.3)] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-40 disabled:shadow-none disabled:hover:bg-[#e8621a] disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <CheckCircle size={20} />
            <span className="text-[16px] tracking-wide">{loading ? 'Procesando Pedido...' : 'Confirmar y Enviar Pedido'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
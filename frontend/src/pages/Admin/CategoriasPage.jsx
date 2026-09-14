import { useState, useEffect } from 'react'
import { categoriasService } from '../../services/categoriasService'
import Loading from '../../components/shared/Loading'
import Alert from '../../components/shared/Alert'
import Modal from '../../components/shared/Modal'
import { Edit, Trash2, Plus, FolderOpen, Tag } from 'lucide-react'

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState(null)
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    orden: 0,
  })

  useEffect(() => {
    cargarCategorias()
  }, [])

  const cargarCategorias = async () => {
    try {
      setLoading(true)
      const res = await categoriasService.obtenerTodas()
      setCategorias(res.data)
    } catch (error) {
      setAlert({ type: 'error', message: 'Error cargando categorías' })
    } finally {
      setLoading(false)
    }
  }

  const abrirModal = (categoria = null) => {
    if (categoria) {
      setEditando(categoria)
      setFormData({
        nombre: categoria.nombre,
        descripcion: categoria.descripcion,
        orden: categoria.orden,
      })
    } else {
      setEditando(null)
      setFormData({ nombre: '', descripcion: '', orden: 0 })
    }
    setModalOpen(true)
  }

  const guardar = async (e) => {
    e.preventDefault()
    try {
      if (editando) {
        await categoriasService.actualizar(editando.id, formData)
        setAlert({ type: 'success', message: 'Categoría actualizada correctamente' })
      } else {
        await categoriasService.crear(formData)
        setAlert({ type: 'success', message: 'Categoría creada exitosamente' })
      }
      cargarCategorias()
      setModalOpen(false)
    } catch (error) {
      setAlert({ type: 'error', message: 'Error al guardar la categoría' })
    }
  }

  const eliminar = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta categoría? Esto podría afectar a los productos asociados.')) {
      try {
        await categoriasService.eliminar(id)
        setAlert({ type: 'success', message: 'Categoría eliminada' })
        cargarCategorias()
      } catch (error) {
        setAlert({ type: 'error', message: 'Error al eliminar. Verifica que no tenga productos asociados.' })
      }
    }
  }

  if (loading) return <Loading />

  return (
    <div className="space-y-6 text-[#f5ead8] animate-fade-in w-full max-w-7xl mx-auto px-2 sm:px-0">
      
      {/* ========== HEADER ========== */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-[#231a0d] border border-[#3a2a18] p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold flex items-center gap-2 text-[#f5ead8]">
            <FolderOpen className="text-[#e8621a] shrink-0" size={26} />
            <span>Gestión de Categorías</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#9c8a6e] mt-1">Organiza cómo ven tus clientes el menú.</p>
        </div>
        <button
          onClick={() => abrirModal()}
          className="bg-[#e8621a] hover:bg-orange-600 text-white font-semibold py-3 sm:py-2.5 px-5 rounded-xl shadow-[0_4px_15px_rgba(232,98,26,0.3)] transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-0.5 text-sm"
        >
          <Plus size={20} />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {alert && (
        <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
      )}

      {/* ========== ESTADO VACÍO ========== */}
      {categorias.length === 0 ? (
        <div className="bg-[#231a0d] border border-[#3a2a18] rounded-3xl p-8 sm:p-12 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="bg-[#1a1209] p-5 rounded-full mb-4 border border-[#3a2a18]">
            <Tag size={40} className="text-[#9c8a6e] opacity-50" />
          </div>
          <h2 className="text-xl font-serif font-bold text-[#f5ead8] mb-2">Sin categorías</h2>
          <p className="text-[#9c8a6e] text-sm max-w-md">No tienes ninguna categoría registrada. Crea la primera para empezar a organizar tus productos.</p>
          <button 
            onClick={() => abrirModal()} 
            className="mt-6 text-[#e8621a] font-bold hover:underline text-sm"
          >
            + Crear mi primera categoría
          </button>
        </div>
      ) : (
        /* ========== GRID DE CATEGORÍAS ========== */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {categorias.map(cat => (
            <div 
              key={cat.id} 
              className="bg-[#231a0d] border border-[#3a2a18] rounded-2xl p-5 hover:border-[#e8621a]/50 transition-all duration-300 shadow-md flex flex-col justify-between group"
            >
              
              <div className="mb-6">
                <div className="flex justify-between items-start gap-2 mb-3">
                  <h3 className="text-base sm:text-lg font-serif font-bold text-[#f0a030] truncate group-hover:text-orange-400 transition">
                    {cat.nombre}
                  </h3>
                  <span className="bg-[#1a1209] border border-[#3a2a18] text-[#9c8a6e] text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider shrink-0 shadow-inner group-hover:border-[#e8621a]/50 transition">
                    Orden: {cat.orden}
                  </span>
                </div>
                <p className="text-[#9c8a6e] text-xs sm:text-sm line-clamp-2 min-h-[36px] leading-relaxed">
                  {cat.descripcion || <span className="italic opacity-50">Sin descripción...</span>}
                </p>
              </div>

              <div className="flex gap-3 border-t border-[#3a2a18] pt-4">
                <button
                  onClick={() => abrirModal(cat)}
                  className="flex-1 bg-[#1a1209] hover:bg-[#2e2010] text-[#f5ead8] border border-[#3a2a18] hover:border-[#e8621a] py-2.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-sm"
                >
                  <Edit size={16} className="text-[#e8621a]" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => eliminar(cat.id)}
                  className="flex-1 bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 hover:border-red-600 py-2.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-sm"
                >
                  <Trash2 size={16} />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========== MODAL ========== */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editando ? 'Editar Categoría' : 'Nueva Categoría'}
      >
        <form onSubmit={guardar} className="space-y-4 sm:space-y-5 mt-4">
          
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-semibold text-[#9c8a6e]">
              Nombre de la categoría <span className="text-[#e8621a]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Carnes al Carbón"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full bg-[#1a1209] border border-[#3a2a18] rounded-xl px-4 py-3 text-sm text-[#f5ead8] placeholder-[#9c8a6e]/50 focus:outline-none focus:border-[#e8621a] focus:ring-1 focus:ring-[#e8621a] transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-semibold text-[#9c8a6e]">Descripción</label>
            <textarea
              placeholder="Breve detalle de esta sección..."
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              className="w-full bg-[#1a1209] border border-[#3a2a18] rounded-xl px-4 py-3 text-sm text-[#f5ead8] placeholder-[#9c8a6e]/50 focus:outline-none focus:border-[#e8621a] focus:ring-1 focus:ring-[#e8621a] transition-all resize-none"
              rows="3"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-semibold text-[#9c8a6e]">Orden (Prioridad en el menú)</label>
            <input
              type="number"
              min="0"
              value={formData.orden}
              onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) || 0 })}
              className="w-full bg-[#1a1209] border border-[#3a2a18] rounded-xl px-4 py-3 text-sm text-[#f5ead8] focus:outline-none focus:border-[#e8621a] focus:ring-1 focus:ring-[#e8621a] transition-all"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="flex-1 bg-[#1a1209] hover:bg-[#2e2010] text-[#9c8a6e] border border-[#3a2a18] py-3 rounded-xl text-sm font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="flex-1 bg-[#e8621a] hover:bg-orange-600 text-white shadow-lg py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {editando ? 'Guardar Cambios' : 'Crear Categoría'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
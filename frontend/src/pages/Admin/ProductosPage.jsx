import { useState, useEffect } from 'react'
import { productosService } from '../../services/productosService'
import { categoriasService } from '../../services/categoriasService'
import Loading from '../../components/shared/Loading'
import Alert from '../../components/shared/Alert'
import Modal from '../../components/shared/Modal'
import { Edit, Trash2, Plus, Eye, EyeOff, UtensilsCrossed, Package, Trash, ImageIcon } from 'lucide-react'

export default function ProductosPage() {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState(null)
  const [imagenFile, setImagenFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [subiendoCloudinary, setSubiendoCloudinary] = useState(false)
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoria_id: '',
    precio: '',
    imagen_url: '',
    porciones: [],
    adiciones: [],
  })

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const [prodRes, catRes] = await Promise.all([
        productosService.obtenerTodos(),
        categoriasService.obtenerTodas(),
      ])
      setProductos(prodRes.data)
      setCategorias(catRes.data)
    } catch (error) {
      setAlert({ type: 'error', message: 'Error cargando datos' })
    } finally {
      setLoading(false)
    }
  }

  const abrirModal = (producto = null) => {
    setImagenFile(null)
    if (producto) {
      setEditando(producto)
      setFormData({
        nombre: producto.nombre,
        descripcion: producto.descripcion || '',
        categoria_id: producto.categoria_id,
        precio: producto.precio !== null ? producto.precio : '',
        imagen_url: producto.imagen_url || '',
        porciones: producto.porciones ? [...producto.porciones] : [],
        adiciones: producto.adiciones ? [...producto.adiciones] : [],
      })
      setPreview(producto.imagen_url || '')
    } else {
      setEditando(null)
      setFormData({
        nombre: '',
        descripcion: '',
        categoria_id: categorias[0]?.id || '',
        precio: '',
        imagen_url: '',
        porciones: [],
        adiciones: [],
      })
      setPreview('')
    }
    setModalOpen(true)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagenFile(file);
      setPreview(URL.createObjectURL(file));
    }
  }

  const subirACloudinary = async (file) => {
    const dataForm = new FormData();
    dataForm.append('file', file);
    dataForm.append('upload_preset', 'restaurante_preset');

    const response = await fetch(
      'https://api.cloudinary.com/v1_1/ohjhp1t3/image/upload',
      {
        method: 'POST',
        body: dataForm,
      }
    );
    
    const data = await response.json();
    if (data.secure_url) {
      return data.secure_url;
    } else {
      throw new Error('Error al subir la imagen');
    }
  }

  const agregarPorcion = () => {
    setFormData({
      ...formData,
      porciones: [...formData.porciones, { gramos: '', precio: '' }]
    })
  }

  const actualizarPorcion = (index, campo, valor) => {
    const nuevasPorciones = [...formData.porciones];
    nuevasPorciones[index][campo] = valor;
    setFormData({ ...formData, porciones: nuevasPorciones });
  }

  const eliminarPorcion = (index) => {
    setFormData({ ...formData, porciones: formData.porciones.filter((_, i) => i !== index) });
  }

  const agregarAdicion = () => {
    setFormData({
      ...formData,
      adiciones: [...formData.adiciones, { nombre: '', precio: '' }]
    })
  }

  const actualizarAdicion = (index, campo, valor) => {
    const nuevasAdiciones = [...formData.adiciones];
    nuevasAdiciones[index][campo] = valor;
    setFormData({ ...formData, adiciones: nuevasAdiciones });
  }

  const eliminarAdicion = (index) => {
    setFormData({ ...formData, adiciones: formData.adiciones.filter((_, i) => i !== index) });
  }

  const guardar = async (e) => {
    e.preventDefault()
    try {
      setSubiendoCloudinary(true)
      let urlFinalImagen = formData.imagen_url

      if (imagenFile) {
        urlFinalImagen = await subirACloudinary(imagenFile)
      }

      const datosAEnviar = {
        ...formData,
        imagen_url: urlFinalImagen,
        precio: formData.precio !== '' ? parseFloat(formData.precio) : undefined,
        porciones: formData.porciones.map(p => ({
          ...(p.id ? { id: p.id } : {}),
          gramos: parseInt(p.gramos, 10) || 0,
          precio: parseFloat(p.precio) || 0
        })),
        adiciones: formData.adiciones.map(a => ({
          ...(a.id ? { id: a.id } : {}),
          nombre: a.nombre,
          precio: parseFloat(a.precio) || 0
        }))
      }

      if (editando) {
        await productosService.actualizar(editando.id, datosAEnviar)
        setAlert({ type: 'success', message: 'Producto actualizado' })
      } else {
        await productosService.crear(datosAEnviar)
        setAlert({ type: 'success', message: 'Producto creado' })
      }
      cargarDatos()
      setModalOpen(false)
    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.message || error.message || 'Error al guardar' })
    } finally {
      setSubiendoCloudinary(false)
    }
  }

  const toggleDisponibilidad = async (id) => {
    try {
      await productosService.toggleDisponibilidad(id)
      setAlert({ type: 'success', message: 'Disponibilidad actualizada' })
      cargarDatos()
    } catch (error) {
      setAlert({ type: 'error', message: 'Error al actualizar disponibilidad' })
    }
  }

  const eliminar = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await productosService.eliminar(id)
        setAlert({ type: 'success', message: 'Producto eliminado' })
        cargarDatos()
      } catch (error) {
        setAlert({ type: 'error', message: 'Error al eliminar' })
      }
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

  if (loading) return <Loading />

  return (
    <div className="space-y-6 text-[#f5ead8] animate-fade-in pb-12 w-full max-w-7xl mx-auto px-2 sm:px-0">
      
      {/* ========== HEADER ========== */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-[#231a0d] border border-[#3a2a18] p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm">
        <div>
          <h1 className="text-xl sm:text-3xl font-serif font-bold text-[#f5ead8] flex items-center gap-2">
            <UtensilsCrossed className="text-[#e8621a] shrink-0" size={26} />
            <span>Gestión de Productos</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#9c8a6e] mt-1">Administra platos, porciones, adiciones y disponibilidad.</p>
        </div>
        <button
          onClick={() => abrirModal()}
          className="bg-[#e8621a] hover:bg-orange-600 text-white font-semibold py-3 px-5 rounded-xl shadow-[0_4px_15px_rgba(232,98,26,0.3)] transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-0.5 text-sm"
        >
          <Plus size={20} />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* ========== TABLA ========== */}
      <div className="bg-[#231a0d] border border-[#3a2a18] rounded-2xl sm:rounded-3xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[800px]">
            <thead>
              <tr className="border-b border-[#3a2a18] text-[#9c8a6e] text-xs uppercase tracking-wider bg-[#1a1209]/40">
                <th className="py-4 px-5">Producto</th>
                <th className="py-4 px-5">Categoría</th>
                <th className="py-4 px-5">Precio / Porciones</th>
                <th className="py-4 px-5">Estado</th>
                <th className="py-4 px-5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3a2a18]/50">
              {productos.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-16 text-[#9c8a6e]">
                    <Package size={42} className="mx-auto mb-3 opacity-40" />
                    <p className="font-serif text-base text-[#f5ead8]">No hay productos registrados</p>
                  </td>
                </tr>
              ) : (
                productos.map(producto => (
                  <tr key={producto.id} className="hover:bg-[#1a1209]/60 transition-colors">
                    <td className="py-4 px-5 flex items-center gap-3">
                      <img 
                        src={producto.imagen_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100"} 
                        alt={producto.nombre} 
                        className="w-12 h-12 rounded-xl object-cover border border-[#3a2a18] shrink-0" 
                      />
                      <div>
                        <p className="font-serif font-bold text-[#f5ead8]">{producto.nombre}</p>
                        <p className="text-xs text-[#9c8a6e] line-clamp-1">{producto.descripcion || 'Sin descripción'}</p>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-[#9c8a6e] font-medium">{producto.categoria?.nombre || 'General'}</td>
                    
                    <td className="py-4 px-5 font-bold text-[#f0a030]">
                      {producto.porciones && producto.porciones.length > 0 ? (
                        <div className="text-xs space-y-0.5">
                          {producto.porciones.map((p, idx) => (
                            <div key={idx}>
                              {p.gramos}g: {formatearPrecio(p.precio)}
                            </div>
                          ))}
                          {producto.adiciones && producto.adiciones.length > 0 && (
                            <div className="text-amber-300/80 font-normal mt-1">
                              +{producto.adiciones.length} adiciones
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          {formatearPrecio(producto.precio)}
                          {producto.adiciones && producto.adiciones.length > 0 && (
                            <div className="text-amber-300/80 font-normal text-xs mt-1">
                              +{producto.adiciones.length} adiciones
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-5">
                      <button
                        onClick={() => toggleDisponibilidad(producto.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm transition-all ${
                          producto.disponible
                            ? 'bg-green-500/10 border-green-500/20 text-green-400'
                            : 'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}
                      >
                        {producto.disponible ? (
                          <>
                            <Eye size={14} />
                            <span className="hidden sm:inline">Disponible</span>
                          </>
                        ) : (
                          <>
                            <EyeOff size={14} />
                            <span className="hidden sm:inline">No Disponible</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-4 px-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => abrirModal(producto)}
                          className="bg-[#1a1209] border border-[#3a2a18] text-[#f5ead8] hover:bg-[#e8621a] hover:text-white p-2.5 rounded-xl transition-all duration-300 shadow-sm"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => eliminar(producto.id)}
                          className="bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-600 hover:text-white p-2.5 rounded-xl transition-all duration-300 shadow-sm"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========== MODAL ========== */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editando ? 'Editar Producto' : 'Nuevo Producto'}
      >
        <form onSubmit={guardar} className="space-y-4 text-[#f5ead8] pt-4 max-h-[75vh] overflow-y-auto px-1">
          
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-semibold text-[#9c8a6e]">Nombre <span className="text-[#e8621a]">*</span></label>
            <input
              type="text"
              required
              placeholder="Ej: Churrasco a la Parrilla"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full bg-[#1a1209] border border-[#3a2a18] rounded-xl px-4 py-3 text-sm text-[#f5ead8] placeholder-[#9c8a6e]/50 focus:outline-none focus:border-[#e8621a] focus:ring-1 focus:ring-[#e8621a] transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-semibold text-[#9c8a6e]">Descripción</label>
            <textarea
              placeholder="Detalle de ingredientes..."
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              className="w-full bg-[#1a1209] border border-[#3a2a18] rounded-xl px-4 py-3 text-sm text-[#f5ead8] placeholder-[#9c8a6e]/50 focus:outline-none focus:border-[#e8621a] focus:ring-1 focus:ring-[#e8621a] transition-all resize-none"
              rows="3"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-semibold text-[#9c8a6e]">Categoría <span className="text-[#e8621a]">*</span></label>
            <select
              required
              value={formData.categoria_id}
              onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
              className="w-full bg-[#1a1209] border border-[#3a2a18] rounded-xl px-4 py-3 text-sm text-[#f5ead8] focus:outline-none focus:border-[#e8621a] focus:ring-1 focus:ring-[#e8621a] transition-all appearance-none cursor-pointer"
            >
              <option value="">Selecciona una categoría</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-semibold text-[#9c8a6e]">
              Precio Base (COP) <span className="text-[11px] text-[#9c8a6e]/70 font-normal">(Opcional si usas porciones)</span>
            </label>
            <input
              type="number"
              step="1"
              min="0"
              placeholder="Ej: 25000"
              value={formData.precio}
              onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
              className="w-full bg-[#1a1209] border border-[#3a2a18] rounded-xl px-4 py-3 text-sm text-[#f5ead8] placeholder-[#9c8a6e]/50 focus:outline-none focus:border-[#e8621a] focus:ring-1 focus:ring-[#e8621a] transition-all"
            />
          </div>

          {/* ========== PORCIONES ========== */}
          <div className="border border-[#3a2a18] bg-[#1a1209]/40 p-3 sm:p-4 rounded-2xl space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs sm:text-sm font-semibold text-[#f0a030] flex items-center gap-1.5">
                <UtensilsCrossed size={16} />
                <span>Porciones / Gramajes</span>
              </label>
              <button
                type="button"
                onClick={agregarPorcion}
                className="bg-[#231a0d] hover:bg-[#3a2a18] text-[#f5ead8] border border-[#3a2a18] text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shrink-0"
              >
                <Plus size={14} /> Agregar
              </button>
            </div>

            {formData.porciones.length === 0 ? (
              <p className="text-xs text-[#9c8a6e] italic text-center py-2">Sin porciones</p>
            ) : (
              <div className="space-y-2">
                {formData.porciones.map((porcion, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Gramos"
                      value={porcion.gramos}
                      onChange={(e) => actualizarPorcion(index, 'gramos', e.target.value)}
                      className="flex-1 bg-[#1a1209] border border-[#3a2a18] rounded-xl px-3 py-2 text-xs text-[#f5ead8] focus:outline-none focus:border-[#e8621a]"
                    />
                    <input
                      type="number"
                      placeholder="Precio"
                      value={porcion.precio}
                      onChange={(e) => actualizarPorcion(index, 'precio', e.target.value)}
                      className="flex-1 bg-[#1a1209] border border-[#3a2a18] rounded-xl px-3 py-2 text-xs text-[#f5ead8] focus:outline-none focus:border-[#e8621a]"
                    />
                    <button
                      type="button"
                      onClick={() => eliminarPorcion(index)}
                      className="bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white p-2 rounded-xl transition-colors border border-red-500/20 shrink-0"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ========== ADICIONES ========== */}
          <div className="border border-[#3a2a18] bg-[#1a1209]/40 p-3 sm:p-4 rounded-2xl space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs sm:text-sm font-semibold text-[#f0a030] flex items-center gap-1.5">
                <span className="text-base">🧀</span>
                <span>Adiciones / Toppings</span>
              </label>
              <button
                type="button"
                onClick={agregarAdicion}
                className="bg-[#231a0d] hover:bg-[#3a2a18] text-[#f5ead8] border border-[#3a2a18] text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shrink-0"
              >
                <Plus size={14} /> Agregar
              </button>
            </div>

            {formData.adiciones.length === 0 ? (
              <p className="text-xs text-[#9c8a6e] italic text-center py-2">Sin adiciones</p>
            ) : (
              <div className="space-y-2">
                {formData.adiciones.map((adicion, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Nombre"
                      value={adicion.nombre}
                      onChange={(e) => actualizarAdicion(index, 'nombre', e.target.value)}
                      className="flex-1 bg-[#1a1209] border border-[#3a2a18] rounded-xl px-3 py-2 text-xs text-[#f5ead8] focus:outline-none focus:border-[#e8621a]"
                    />
                    <input
                      type="number"
                      placeholder="Precio"
                      value={adicion.precio}
                      onChange={(e) => actualizarAdicion(index, 'precio', e.target.value)}
                      className="flex-1 bg-[#1a1209] border border-[#3a2a18] rounded-xl px-3 py-2 text-xs text-[#f5ead8] focus:outline-none focus:border-[#e8621a]"
                    />
                    <button
                      type="button"
                      onClick={() => eliminarAdicion(index)}
                      className="bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white p-2 rounded-xl transition-colors border border-red-500/20 shrink-0"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ========== IMAGEN ========== */}
          <div className="space-y-2 border border-[#3a2a18] bg-[#1a1209]/40 p-4 rounded-2xl">
            <label className="text-xs sm:text-sm font-semibold text-[#f0a030] flex items-center gap-1.5">
              <ImageIcon size={16} />
              <span>Imagen (Cloudinary)</span>
            </label>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {preview ? (
                <div className="w-20 h-20 rounded-xl overflow-hidden border border-[#3a2a18] shrink-0 bg-[#1a1209]">
                  <img src={preview} alt="Vista previa" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-xl border border-dashed border-[#3a2a18] flex items-center justify-center text-[#9c8a6e] shrink-0 bg-[#1a1209]">
                  <ImageIcon size={24} />
                </div>
              )}

              <div className="flex-1 w-full space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-xs text-[#9c8a6e] file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#231a0d] file:text-[#f5ead8] hover:file:bg-[#3a2a18] cursor-pointer border border-[#3a2a18] rounded-xl p-1 bg-[#1a1209]"
                />
                <input
                  type="url"
                  placeholder="O pega URL externa"
                  value={formData.imagen_url}
                  onChange={(e) => {
                    setFormData({ ...formData, imagen_url: e.target.value });
                    setPreview(e.target.value);
                  }}
                  className="w-full bg-[#1a1209] border border-[#3a2a18] rounded-xl px-3 py-2 text-xs text-[#f5ead8] placeholder-[#9c8a6e]/50 focus:outline-none focus:border-[#e8621a]"
                />
              </div>
            </div>
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
              disabled={subiendoCloudinary}
              className="flex-1 bg-[#e8621a] hover:bg-orange-600 text-white shadow-lg py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {subiendoCloudinary ? 'Subiendo...' : (editando ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
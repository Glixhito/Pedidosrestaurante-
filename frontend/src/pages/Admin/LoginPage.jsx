import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { authService } from '../../services/authService'
import Alert from '../../components/shared/Alert'
import { LogIn, Flame, Lock, Mail } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('admin@restaurante.com')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState(null)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setAlert(null)
      const res = await authService.login(email, password)
      login(res.data.access_token, { email })
      navigate('/admin/dashboard')
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Error al iniciar sesión'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1a1209] text-[#f5ead8] font-sans flex items-center justify-center p-4">
      <div className="bg-[#231a0d] border border-[#3a2a18] rounded-3xl shadow-2xl p-8 w-full max-w-md relative overflow-hidden animate-fade-in">
        
        {/* Barra decorativa superior */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 via-[#e8621a] to-orange-500"></div>

        {/* CONTENIDO */}
        <div className="text-center mb-8 pt-4">
          <div className="w-16 h-16 bg-[#1a1209] border border-[#3a2a18] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner text-[#e8621a] group hover:border-[#e8621a] transition">
            <Flame size={32} />
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#f5ead8]">Panel Administrativo</h2>
          <p className="text-sm text-[#9c8a6e] mt-1">Inicia sesión para gestionar el asadero</p>
        </div>

        {alert && (
          <div className="mb-4">
            <Alert
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert(null)}
            />
          </div>
        )}

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#9c8a6e] mb-2.5 flex items-center gap-1.5">
              <Mail size={14} /> Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1a1209] border border-[#3a2a18] rounded-xl px-4 py-3.5 text-sm text-[#f5ead8] placeholder-[#9c8a6e]/50 focus:outline-none focus:border-[#e8621a] focus:ring-1 focus:ring-[#e8621a] transition-all"
              required
              disabled={loading}
            />
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#9c8a6e] mb-2.5 flex items-center gap-1.5">
              <Lock size={14} /> Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1a1209] border border-[#3a2a18] rounded-xl px-4 py-3.5 text-sm text-[#f5ead8] placeholder-[#9c8a6e]/50 focus:outline-none focus:border-[#e8621a] focus:ring-1 focus:ring-[#e8621a] transition-all"
              required
              disabled={loading}
            />
          </div>

          {/* Botón */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#e8621a] hover:bg-orange-600 text-white font-serif font-bold py-4 rounded-xl shadow-[0_5px_20px_rgba(232,98,26,0.3)] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0 mt-2"
          >
            <LogIn size={20} />
            <span className="text-[15px]">{loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}</span>
          </button>
        </form>

        {/* INFO DE CREDENCIALES */}
        <div className="mt-6 p-4 bg-[#1a1209] border border-[#3a2a18] rounded-2xl text-center hover:border-[#e8621a]/50 transition">
          <p className="text-xs text-[#9c8a6e]">
            Credenciales de prueba: <br />
            <strong className="text-[#f0a030] font-mono mt-1.5 inline-block tracking-wider">admin@restaurante.com / admin123</strong>
          </p>
        </div>
      </div>
    </div>
  )
}
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/api'
import './LoginC.css'

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
      <path d="m3 8 9 6 9-6" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  )
}

function EyeIcon({ hidden }) {
  return hidden ? (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
      <path d="M9.9 5.2A10.7 10.7 0 0 1 12 5c5 0 8.7 4.2 9.7 6a15.5 15.5 0 0 1-3.1 3.6" />
      <path d="M6.2 6.2C3.8 7.6 2.5 10 2.3 11c1 1.8 4.7 6 9.7 6 1 0 2-.2 2.8-.5" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2.3 12C3.3 10.2 7 6 12 6s8.7 4.2 9.7 6c-1 1.8-4.7 6-9.7 6s-8.7-4.2-9.7-6Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

const handleSubmit = async (e) => {
  e.preventDefault()

  setError('')
  setLoading(true)

  try {
    const respuesta = await login(email, password)

    console.log('RESPUESTA DEL LOGIN:', respuesta)
    console.log('USUARIO RECIBIDO:', respuesta?.usuario)
    console.log('ROL RECIBIDO:', respuesta?.usuario?.rol)

    const datosUsuario =
      respuesta?.Usuario ??
      respuesta?.data ??
      respuesta

    if (!datosUsuario?.rol) {
      throw new Error(
        'El servidor no devolvió el rol del usuario.'
      )
    }

    localStorage.setItem(
      'usuario',
      JSON.stringify(datosUsuario)
    )

    console.log('USUARIO GUARDADO:', datosUsuario)
    console.log('ROL:', datosUsuario.rol)

    navigate('/dashboard')

  } catch (error) {
    console.error(
      'Error al iniciar sesión:',
      error
    )

    setError(
      error.message ||
      'Error al iniciar sesión'
    )

  } finally {
    setLoading(false)
  }
}
  return (
    <div className="login-page">
      <div className="login-background-shape shape-one"></div>
      <div className="login-background-shape shape-two"></div>

      <main className="login-container">

        <section className="login-brand">
          <div className="brand-glow"></div>

          <div className="login-brand-content">
            <div className="logo-wrapper">
              <img src="/logo.png" alt="AutoCore" />
            </div>

            <h1>AutoCore</h1>

            <p className="brand-description">
              Soluciones inteligentes
              <br />
              para el mundo automotriz
            </p>

            <div className="brand-line"></div>

            <p className="brand-footer">
              Gestiona tu taller de forma
              <br />
              sencilla, rápida y segura.
            </p>
          </div>
        </section>

        <section className="login-form-container">
          <div className="login-content">

            <div className="welcome-icon">
              <span>↗</span>
            </div>

            <div className="login-header">
              <span className="welcome-text">BIENVENIDO</span>

              <h2>Iniciar sesión</h2>

              <p className="login-subtitle">
                Ingresa a tu cuenta para continuar
              </p>
            </div>

            <form onSubmit={handleSubmit}>

              <div className="form-group">
                <label htmlFor="email">
                  Correo electrónico
                </label>

                <div className="input-wrapper">
                  <MailIcon />

                  <input
                    id="email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="password-label">
                  <label htmlFor="password">
                    Contraseña
                  </label>

                  <button
                    type="button"
                    className="forgot-password"
                    onClick={() => alert('Función de recuperación próximamente')}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                <div className="input-wrapper">
                  <LockIcon />

                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword
                        ? 'Ocultar contraseña'
                        : 'Mostrar contraseña'
                    }
                  >
                    <EyeIcon hidden={showPassword} />
                  </button>
                </div>
              </div>

              {error && (
                <div className="login-error">
                  <span>!</span>
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >
                <span>
                  {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                </span>

                {!loading && <span className="button-arrow">→</span>}
              </button>

            </form>

            <div className="divider">
              <span>o</span>
            </div>

            <p className="register-text">
              ¿No tienes una cuenta?
              <button type="button">
                Regístrate
              </button>
            </p>

            <p className="security-text">
              🔒 Tu información está protegida
            </p>

          </div>
        </section>

      </main>
    </div>
  )
}

export default Login
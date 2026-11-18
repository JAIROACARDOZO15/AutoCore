import { Component } from 'react'

class PageErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error) {
    console.error('Error al mostrar la página:', error)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <main style={{
        minHeight: '100vh',
        display: 'grid',
        placeContent: 'center',
        padding: 24,
        background: '#faf8f5',
        color: '#292524',
        fontFamily: 'Arial, sans-serif'
      }}>
        <section style={{
          width: 'min(100%, 620px)',
          padding: 28,
          border: '1px solid #f1d7c2',
          borderRadius: 18,
          background: '#fff',
          boxShadow: '0 12px 35px rgba(124,45,18,.08)'
        }}>
          <span style={{ color: '#c2410c', fontWeight: 800, letterSpacing: 1.2, fontSize: 11 }}>AUTOCORE</span>
          <h1 style={{ margin: '10px 0 8px', fontSize: 22 }}>No pudimos mostrar esta pantalla</h1>
          <p style={{ color: '#76675d', lineHeight: 1.6 }}>La aplicación encontró un error al cargar la información. Vuelve al inicio del portal o recarga para intentarlo de nuevo.</p>
          <details style={{ margin: '14px 0', color: '#8a3b24', fontSize: 12 }}>
            <summary>Ver detalle técnico</summary>
            <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{this.state.error.message}</pre>
          </details>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <button type="button" onClick={() => { window.location.href = '/dashboard' }} style={{ border: 0, borderRadius: 9, padding: '10px 14px', background: '#f97316', color: '#fff', fontWeight: 750, cursor: 'pointer' }}>Volver al inicio</button>
            <button type="button" onClick={() => window.location.reload()} style={{ border: '1px solid #eadfd5', borderRadius: 9, padding: '10px 14px', background: '#fff', color: '#65564d', fontWeight: 750, cursor: 'pointer' }}>Recargar</button>
          </div>
        </section>
      </main>
    )
  }
}

export default PageErrorBoundary

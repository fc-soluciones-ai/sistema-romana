import { useState } from 'react'
import { Boleta } from './components/Boleta'
import { Configuracion } from './pages/Configuracion'
import { Historial } from './pages/Historial'
import { Operacion } from './pages/Operacion'
import { Proveedores } from './pages/Proveedores'
import { Resumen } from './pages/Resumen'
import type { Pesaje } from './types'
import { useDatos } from './useDatos'

const SECCIONES = [
  { id: 'resumen', titulo: 'Resumen' },
  { id: 'compras', titulo: 'Compras' },
  { id: 'despachos', titulo: 'Despachos' },
  { id: 'historial', titulo: 'Historial' },
  { id: 'vendedores', titulo: 'Vendedores' },
  { id: 'configuracion', titulo: 'Configuración' },
] as const

type Seccion = (typeof SECCIONES)[number]['id']

function App() {
  const { datos, setDatos, restablecer } = useDatos()
  const [seccion, setSeccion] = useState<Seccion>('resumen')
  const [boletaId, setBoletaId] = useState<string | null>(null)

  // Se busca por id para que la boleta refleje el estado actual del pesaje.
  const boleta = datos.pesajes.find((p) => p.id === boletaId)
  const verBoleta = (p: Pesaje) => setBoletaId(p.id)
  const enPatio = (tipo: Pesaje['tipo']) =>
    datos.pesajes.filter((p) => p.tipo === tipo && p.estado === 'en_patio').length

  return (
    <div className="app">
      <header className="barra-superior">
        <div className="marca">
          <span className="marca-icono" aria-hidden="true">⚖</span>
          <div>
            <strong>{datos.config.nombreEmpresa}</strong>
            <span>Sistema de romana caminera</span>
          </div>
        </div>
        <nav className="navegacion">
          {SECCIONES.map((s) => (
            <button
              key={s.id}
              type="button"
              className={s.id === seccion ? 'activa' : ''}
              onClick={() => setSeccion(s.id)}
            >
              {s.titulo}
              {s.id === 'compras' && enPatio('compra') > 0 && <span className="insignia">{enPatio('compra')}</span>}
              {s.id === 'despachos' && enPatio('despacho') > 0 && (
                <span className="insignia">{enPatio('despacho')}</span>
              )}
            </button>
          ))}
        </nav>
      </header>

      <div className="aviso-prototipo">
        Prototipo de demostración · la báscula está simulada y los datos se guardan solo en este navegador
      </div>

      <main className="contenido">
        {seccion === 'resumen' && <Resumen datos={datos} verBoleta={verBoleta} />}
        {seccion === 'compras' && (
          <Operacion key="compra" tipo="compra" datos={datos} setDatos={setDatos} verBoleta={verBoleta} />
        )}
        {seccion === 'despachos' && (
          <Operacion key="despacho" tipo="despacho" datos={datos} setDatos={setDatos} verBoleta={verBoleta} />
        )}
        {seccion === 'historial' && <Historial datos={datos} setDatos={setDatos} verBoleta={verBoleta} />}
        {seccion === 'vendedores' && <Proveedores datos={datos} setDatos={setDatos} />}
        {seccion === 'configuracion' && (
          <Configuracion datos={datos} setDatos={setDatos} restablecer={restablecer} />
        )}
      </main>

      {boleta && <Boleta pesaje={boleta} datos={datos} onCerrar={() => setBoletaId(null)} />}
    </div>
  )
}

export default App

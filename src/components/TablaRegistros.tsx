import { useState, type ReactNode } from 'react'
import { AccionesRegistro } from './AccionesRegistro'

export interface ColumnaRegistro {
  clave: string
  etiqueta: string
  numero?: boolean
  corto?: boolean
  placeholder?: string
  paso?: number
}

export interface ColumnaCalculada {
  etiqueta: string
  valor: (id: string) => ReactNode
}

export interface FilaRegistro {
  id: string
  nombre: string
  activo: boolean
  /** Boletas que usan el registro; con una o más solo se puede desactivar. */
  boletas: number
  valores: Record<string, string | number | undefined>
  /** Aviso bajo una casilla, p. ej. un precio fuera de su rango. */
  avisos?: Record<string, string>
}

interface Props {
  titulo: string
  descripcion?: string
  columnas: ColumnaRegistro[]
  columnasCalculadas?: ColumnaCalculada[]
  filas: FilaRegistro[]
  onCambiar: (id: string, clave: string, valor: string) => void
  /** Devuelve un mensaje de error, o null si el registro se agregó. */
  onAgregar: (valores: Record<string, string>) => string | null
  onEliminar: (id: string) => void
  onActivar: (id: string, activo: boolean) => void
}

/**
 * Tabla estándar de registros: se edita en la misma fila, se agrega en la
 * última y se elimina o desactiva con la regla de AccionesRegistro.
 */
export function TablaRegistros({
  titulo,
  descripcion,
  columnas,
  columnasCalculadas = [],
  filas,
  onCambiar,
  onAgregar,
  onEliminar,
  onActivar,
}: Props) {
  const [nuevo, setNuevo] = useState<Record<string, string>>({})
  const [error, setError] = useState('')

  function agregar() {
    const mensaje = onAgregar(nuevo)
    setError(mensaje ?? '')
    if (!mensaje) setNuevo({})
  }

  return (
    <section className="tarjeta">
      <h2>{titulo}</h2>
      {descripcion && <p className="tenue">{descripcion}</p>}
      <div className="tabla-contenedor">
        <table className="tabla">
          <thead>
            <tr>
              {columnas.map((c) => (
                <th key={c.clave} className={c.numero ? 'num' : ''}>
                  {c.etiqueta}
                </th>
              ))}
              {columnasCalculadas.map((c) => (
                <th key={c.etiqueta} className="num">
                  {c.etiqueta}
                </th>
              ))}
              <th />
            </tr>
          </thead>
          <tbody>
            {filas.map((f) => (
              <tr key={f.id} className={f.activo ? '' : 'inactiva'}>
                {columnas.map((c, i) => (
                  <td key={c.clave} className={c.numero ? 'num' : ''}>
                    <input
                      className={`celda-registro ${c.corto ? 'corto' : ''} ${f.avisos?.[c.clave] ? 'fuera-rango' : ''}`}
                      type={c.numero ? 'number' : 'text'}
                      min={c.numero ? 0 : undefined}
                      step={c.paso}
                      value={f.valores[c.clave] ?? ''}
                      onChange={(e) => onCambiar(f.id, c.clave, e.target.value)}
                    />
                    {f.avisos?.[c.clave] && <span className="aviso-rango">{f.avisos[c.clave]}</span>}
                    {i === 0 && !f.activo && <span className="aviso-inactivo">inactivo</span>}
                  </td>
                ))}
                {columnasCalculadas.map((c) => (
                  <td key={c.etiqueta} className="num">
                    {c.valor(f.id)}
                  </td>
                ))}
                <td className="acciones">
                  <AccionesRegistro
                    nombre={f.nombre}
                    activo={f.activo}
                    boletas={f.boletas}
                    onEliminar={() => onEliminar(f.id)}
                    onActivar={(valor) => onActivar(f.id, valor)}
                  />
                </td>
              </tr>
            ))}
            <tr className="fila-nueva">
              {columnas.map((c) => (
                <td key={c.clave} className={c.numero ? 'num' : ''}>
                  <input
                    className={`celda-registro ${c.corto ? 'corto' : ''}`}
                    type={c.numero ? 'number' : 'text'}
                    min={c.numero ? 0 : undefined}
                    step={c.paso}
                    placeholder={c.placeholder}
                    value={nuevo[c.clave] ?? ''}
                    onChange={(e) => setNuevo({ ...nuevo, [c.clave]: e.target.value })}
                  />
                </td>
              ))}
              {columnasCalculadas.map((c) => (
                <td key={c.etiqueta} />
              ))}
              <td className="acciones">
                <button type="button" className="boton chico primario" onClick={agregar}>
                  Agregar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {error && <p className="error">{error}</p>}
    </section>
  )
}

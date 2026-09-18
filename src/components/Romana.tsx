import { useEffect, useState } from 'react'

export interface OpcionSimulacion {
  etiqueta: string
  peso: () => number
}

interface Props {
  opciones: OpcionSimulacion[]
  textoCaptura: string
  /** Devuelve true si el peso se registró; entonces el camión sale de la plataforma. */
  onCapturar: (peso: number) => boolean
}

const RESOLUCION_KG = 10
const LECTURAS_PARA_ESTABLE = 4
const redondear = (kg: number) => Math.max(0, Math.round(kg / RESOLUCION_KG) * RESOLUCION_KG)

/**
 * Indicador de la romana caminera. En el prototipo la lectura es simulada;
 * en producción vendrá del indicador de peso por puerto serie o red.
 */
export function Romana({ opciones, textoCaptura, onCapturar }: Props) {
  const [lectura, setLectura] = useState({ peso: 0, objetivo: 0, quietas: LECTURAS_PARA_ESTABLE })

  useEffect(() => {
    const intervalo = setInterval(() => {
      setLectura((l) => {
        const diferencia = l.objetivo - l.peso
        if (Math.abs(diferencia) <= RESOLUCION_KG) {
          if (l.peso !== l.objetivo) return { ...l, peso: l.objetivo, quietas: 0 }
          return l.quietas >= LECTURAS_PARA_ESTABLE ? l : { ...l, quietas: l.quietas + 1 }
        }
        const oscilacion = (Math.random() - 0.5) * Math.min(160, Math.abs(diferencia) * 0.2)
        return { ...l, peso: redondear(l.peso + diferencia * 0.5 + oscilacion), quietas: 0 }
      })
    }, 150)
    return () => clearInterval(intervalo)
  }, [])

  const estable = lectura.quietas >= LECTURAS_PARA_ESTABLE
  const ponerObjetivo = (kg: number) => setLectura((l) => ({ ...l, objetivo: redondear(kg) }))

  const capturar = () => {
    if (!onCapturar(lectura.peso)) return
    ponerObjetivo(0) // el camión sale de la plataforma
  }

  return (
    <div className="romana">
      <div className="romana-pantalla">
        <span className={`romana-estado ${estable ? 'estable' : 'movimiento'}`}>
          {estable ? '● ESTABLE' : '○ EN MOVIMIENTO'}
        </span>
        <span className="romana-peso">{lectura.peso.toLocaleString('es-CR')}</span>
        <span className="romana-unidad">kg</span>
      </div>

      <button
        type="button"
        className="boton primario grande"
        disabled={!estable || lectura.peso <= 0}
        onClick={capturar}
      >
        {textoCaptura}
      </button>

      <div className="simulador">
        <span className="simulador-titulo">Simulador de báscula (solo demostración)</span>
        <div className="simulador-botones">
          {opciones.map((o) => (
            <button key={o.etiqueta} type="button" className="boton" onClick={() => ponerObjetivo(o.peso())}>
              {o.etiqueta}
            </button>
          ))}
          <button type="button" className="boton" onClick={() => ponerObjetivo(0)}>
            Plataforma libre
          </button>
        </div>
      </div>
    </div>
  )
}

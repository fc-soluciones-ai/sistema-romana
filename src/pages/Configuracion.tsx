import type { Dispatch, SetStateAction } from 'react'
import { TOLERANCIA_TARA_PCT, estaActivo, nuevoId, usadoEn } from '../calculos'
import { TablaRegistros } from '../components/TablaRegistros'
import type { Configuracion as Config, Datos, Material } from '../types'

interface Props {
  datos: Datos
  setDatos: Dispatch<SetStateAction<Datos>>
  restablecer: () => void
}

const CAMPOS: { clave: keyof Config; etiqueta: string }[] = [
  { clave: 'nombreEmpresa', etiqueta: 'Nombre de la empresa' },
  { clave: 'cedulaJuridica', etiqueta: 'Cédula jurídica' },
  { clave: 'direccion', etiqueta: 'Dirección' },
  { clave: 'telefono', etiqueta: 'Teléfono' },
  { clave: 'exportador', etiqueta: 'Exportador (comprador de toda la chatarra)' },
]

/** Devuelve undefined cuando la casilla queda en blanco, para no guardar un rango falso. */
const aNumero = (texto?: string) =>
  texto === undefined || texto.trim() === '' ? undefined : Math.max(0, Number(texto))

const fueraDeRango = (m: Material) =>
  m.precioMin !== undefined && m.precioMax !== undefined && (m.precioKg < m.precioMin || m.precioKg > m.precioMax)

export function Configuracion({ datos, setDatos, restablecer }: Props) {
  const cambiarConfig = (clave: keyof Config, valor: string) =>
    setDatos((d) => ({ ...d, config: { ...d.config, [clave]: valor } }))

  const cambiarMaterial = (id: string, clave: string, valor: string) =>
    setDatos((d) => ({
      ...d,
      materiales: d.materiales.map((m) =>
        m.id === id
          ? { ...m, [clave]: clave === 'nombre' ? valor : clave === 'precioKg' ? (aNumero(valor) ?? 0) : aNumero(valor) }
          : m,
      ),
    }))

  function agregarMaterial(v: Record<string, string>): string | null {
    const nombre = (v.nombre ?? '').trim()
    if (!nombre) return 'Escriba el nombre del material.'
    if (datos.materiales.some((m) => m.nombre.toLowerCase() === nombre.toLowerCase()))
      return 'Ya existe un material con ese nombre.'
    const min = aNumero(v.precioMin)
    const max = aNumero(v.precioMax)
    if (min !== undefined && max !== undefined && min > max)
      return 'El mínimo del rango no puede ser mayor que el máximo.'
    const material: Material = {
      id: nuevoId(),
      nombre,
      precioKg: aNumero(v.precioKg) ?? (min !== undefined && max !== undefined ? Math.round((min + max) / 2) : 0),
      precioMin: min,
      precioMax: max,
    }
    setDatos((d) => ({ ...d, materiales: [...d.materiales, material] }))
    return null
  }

  return (
    <div className="columnas">
      <section className="tarjeta">
        <h2>Datos de la empresa</h2>
        <p className="tenue">Aparecen en el encabezado de las boletas.</p>
        <div className="formulario una-columna">
          {CAMPOS.map((c) => (
            <label key={c.clave}>
              {c.etiqueta}
              <input value={datos.config[c.clave]} onChange={(e) => cambiarConfig(c.clave, e.target.value)} />
            </label>
          ))}
        </div>

        <h2 className="separado">Control de tara</h2>
        <p className="tenue">
          Cuánto puede apartarse la tara pesada de la registrada para el vehículo antes de que el sistema pida
          confirmación al pesador.
        </p>
        <label>
          Tolerancia (%)
          <input
            type="number"
            min={0}
            max={50}
            step={0.5}
            className="precio"
            value={datos.config.toleranciaTaraPct ?? TOLERANCIA_TARA_PCT}
            onChange={(e) =>
              setDatos((d) => ({
                ...d,
                config: { ...d.config, toleranciaTaraPct: Math.min(50, Math.max(0, Number(e.target.value))) },
              }))
            }
          />
        </label>

        <h2 className="separado">Datos de demostración</h2>
        <p className="tenue">Borra todo lo registrado y vuelve a cargar los ejemplos.</p>
        <button
          type="button"
          className="boton peligro"
          onClick={() => window.confirm('¿Borrar todo y cargar los datos de demostración?') && restablecer()}
        >
          Restablecer demostración
        </button>
      </section>

      <div className="columna-simple">
        <TablaRegistros
          titulo="Materiales y precios de compra"
          descripcion="Agregue los materiales que compre el negocio. El cambio de precio aplica a las compras nuevas;
            las boletas ya emitidas conservan el precio que tenían."
          columnas={[
            { clave: 'nombre', etiqueta: 'Material', placeholder: 'Nuevo material (p. ej. bronce)' },
            { clave: 'precioMin', etiqueta: 'Mínimo ₡', numero: true, corto: true, paso: 5 },
            { clave: 'precioMax', etiqueta: 'Máximo ₡', numero: true, corto: true, paso: 5 },
            { clave: 'precioKg', etiqueta: 'Precio por kg ₡', numero: true, corto: true, paso: 5 },
          ]}
          filas={datos.materiales.map((m) => ({
            id: m.id,
            nombre: m.nombre,
            activo: estaActivo(m),
            boletas: usadoEn(datos, 'materialId', m.id),
            valores: { nombre: m.nombre, precioMin: m.precioMin, precioMax: m.precioMax, precioKg: m.precioKg },
            avisos: fueraDeRango(m) ? { precioKg: 'fuera de la referencia' } : undefined,
          }))}
          onCambiar={cambiarMaterial}
          onAgregar={agregarMaterial}
          onEliminar={(id) => setDatos((d) => ({ ...d, materiales: d.materiales.filter((m) => m.id !== id) }))}
          onActivar={(id, activo) => cambiarMaterialActivo(setDatos, id, activo)}
        />
        <p className="ayuda">
          El mínimo y el máximo son solo una referencia: si el precio se sale de ese rango, la casilla lo advierte,
          pero igual lo deja guardar. Si deja el precio en blanco al agregar, se usa el punto medio del rango.
        </p>
      </div>
    </div>
  )
}

function cambiarMaterialActivo(setDatos: Props['setDatos'], id: string, activo: boolean) {
  setDatos((d) => ({ ...d, materiales: d.materiales.map((m) => (m.id === id ? { ...m, activo } : m)) }))
}

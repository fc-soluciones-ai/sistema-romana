import { useState, type Dispatch, type SetStateAction } from 'react'
import { estaActivo, nuevoId, usadoEn } from '../calculos'
import { AccionesRegistro } from '../components/AccionesRegistro'
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

const materialVacio = { nombre: '', precioKg: '', precioMin: '', precioMax: '' }

/** Devuelve undefined cuando la casilla queda en blanco, para no guardar un rango falso. */
const aNumero = (texto: string) => (texto.trim() === '' ? undefined : Math.max(0, Number(texto)))

export function Configuracion({ datos, setDatos, restablecer }: Props) {
  const [nuevo, setNuevo] = useState(materialVacio)
  const [error, setError] = useState('')

  const cambiarConfig = (clave: keyof Config, valor: string) =>
    setDatos((d) => ({ ...d, config: { ...d.config, [clave]: valor } }))

  const cambiarMaterial = (id: string, cambios: Partial<Material>) =>
    setDatos((d) => ({
      ...d,
      materiales: d.materiales.map((m) => (m.id === id ? { ...m, ...cambios } : m)),
    }))

  const eliminarMaterial = (id: string) =>
    setDatos((d) => ({ ...d, materiales: d.materiales.filter((m) => m.id !== id) }))

  function agregarMaterial() {
    const nombre = nuevo.nombre.trim()
    if (!nombre) {
      setError('Escriba el nombre del material.')
      return
    }
    if (datos.materiales.some((m) => m.nombre.toLowerCase() === nombre.toLowerCase())) {
      setError('Ya existe un material con ese nombre.')
      return
    }
    const min = aNumero(nuevo.precioMin)
    const max = aNumero(nuevo.precioMax)
    if (min !== undefined && max !== undefined && min > max) {
      setError('El mínimo del rango no puede ser mayor que el máximo.')
      return
    }
    const material: Material = {
      id: nuevoId(),
      nombre,
      precioKg: aNumero(nuevo.precioKg) ?? (min !== undefined && max !== undefined ? Math.round((min + max) / 2) : 0),
      precioMin: min,
      precioMax: max,
    }
    setDatos((d) => ({ ...d, materiales: [...d.materiales, material] }))
    setNuevo(materialVacio)
    setError('')
  }

  const campoNuevo = (clave: keyof typeof materialVacio) => ({
    value: nuevo[clave],
    onChange: (e: { target: { value: string } }) => setNuevo({ ...nuevo, [clave]: e.target.value }),
  })

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
      </section>

      <section className="tarjeta">
        <h2>Materiales y precios de compra</h2>
        <p className="tenue">
          Agregue los materiales que compre el negocio y edite cualquier dato directamente en la tabla. El cambio
          de precio aplica a las compras nuevas; las boletas ya emitidas conservan el precio que tenían.
        </p>
        <div className="tabla-contenedor">
          <table className="tabla">
            <thead>
              <tr>
                <th>Material</th>
                <th className="num">Mínimo ₡</th>
                <th className="num">Máximo ₡</th>
                <th className="num">Precio por kg ₡</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {datos.materiales.map((m) => {
                const activo = estaActivo(m)
                const fueraDeRango =
                  m.precioMin !== undefined &&
                  m.precioMax !== undefined &&
                  (m.precioKg < m.precioMin || m.precioKg > m.precioMax)
                return (
                  <tr key={m.id} className={activo ? '' : 'inactiva'}>
                    <td>
                      <input
                        className="nombre-registro"
                        value={m.nombre}
                        onChange={(e) => cambiarMaterial(m.id, { nombre: e.target.value })}
                      />
                      {!activo && <span className="aviso-inactivo">inactivo</span>}
                    </td>
                    <td className="num">
                      <input
                        type="number"
                        min={0}
                        step={5}
                        className="precio corto"
                        value={m.precioMin ?? ''}
                        onChange={(e) => cambiarMaterial(m.id, { precioMin: aNumero(e.target.value) })}
                      />
                    </td>
                    <td className="num">
                      <input
                        type="number"
                        min={0}
                        step={5}
                        className="precio corto"
                        value={m.precioMax ?? ''}
                        onChange={(e) => cambiarMaterial(m.id, { precioMax: aNumero(e.target.value) })}
                      />
                    </td>
                    <td className="num">
                      <input
                        type="number"
                        min={0}
                        step={5}
                        className={`precio ${fueraDeRango ? 'fuera-rango' : ''}`}
                        value={m.precioKg}
                        onChange={(e) => cambiarMaterial(m.id, { precioKg: aNumero(e.target.value) ?? 0 })}
                      />
                      {fueraDeRango && <span className="aviso-rango">fuera de la referencia</span>}
                    </td>
                    <td className="acciones">
                      <AccionesRegistro
                        nombre={m.nombre}
                        activo={activo}
                        boletas={usadoEn(datos, 'materialId', m.id)}
                        onEliminar={() => eliminarMaterial(m.id)}
                        onActivar={(valor) => cambiarMaterial(m.id, { activo: valor })}
                      />
                    </td>
                  </tr>
                )
              })}
              <tr className="fila-nueva">
                <td>
                  <input placeholder="Nuevo material (p. ej. bronce)" {...campoNuevo('nombre')} />
                </td>
                <td className="num">
                  <input type="number" min={0} step={5} className="precio corto" {...campoNuevo('precioMin')} />
                </td>
                <td className="num">
                  <input type="number" min={0} step={5} className="precio corto" {...campoNuevo('precioMax')} />
                </td>
                <td className="num">
                  <input type="number" min={0} step={5} className="precio" {...campoNuevo('precioKg')} />
                </td>
                <td className="acciones">
                  <button type="button" className="boton chico primario" onClick={agregarMaterial}>
                    Agregar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {error && <p className="error">{error}</p>}
        <p className="ayuda">
          El mínimo y el máximo son solo una referencia: si el precio se sale de ese rango, la casilla lo advierte,
          pero igual lo deja guardar. Si deja el precio en blanco al agregar, se usa el punto medio del rango.
        </p>

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
    </div>
  )
}

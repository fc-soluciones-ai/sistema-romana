import { useState, type Dispatch, type SetStateAction } from 'react'
import { nuevoId } from '../calculos'
import type { Configuracion as Config, Datos } from '../types'

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

export function Configuracion({ datos, setDatos, restablecer }: Props) {
  const [nuevoMaterial, setNuevoMaterial] = useState('')

  const cambiarConfig = (clave: keyof Config, valor: string) =>
    setDatos((d) => ({ ...d, config: { ...d.config, [clave]: valor } }))

  const cambiarPrecio = (id: string, precioKg: number) =>
    setDatos((d) => ({
      ...d,
      materiales: d.materiales.map((m) => (m.id === id ? { ...m, precioKg: Math.max(0, precioKg) } : m)),
    }))

  function agregarMaterial() {
    const nombre = nuevoMaterial.trim()
    if (!nombre) return
    setDatos((d) => ({ ...d, materiales: [...d.materiales, { id: nuevoId(), nombre, precioKg: 0 }] }))
    setNuevoMaterial('')
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
      </section>

      <section className="tarjeta">
        <h2>Materiales y precios de compra</h2>
        <p className="tenue">
          Precios de ejemplo. El cambio aplica a las compras nuevas; las boletas ya emitidas conservan su precio.
        </p>
        <table className="tabla">
          <thead>
            <tr>
              <th>Material</th>
              <th className="num">Precio por kg (₡)</th>
            </tr>
          </thead>
          <tbody>
            {datos.materiales.map((m) => (
              <tr key={m.id}>
                <td>{m.nombre}</td>
                <td className="num">
                  <input
                    type="number"
                    min={0}
                    step={5}
                    className="precio"
                    value={m.precioKg}
                    onChange={(e) => cambiarPrecio(m.id, Number(e.target.value))}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="fila-agregar">
          <input
            placeholder="Nuevo material (p. ej. bronce)"
            value={nuevoMaterial}
            onChange={(e) => setNuevoMaterial(e.target.value)}
          />
          <button type="button" className="boton" onClick={agregarMaterial}>
            Agregar
          </button>
        </div>

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

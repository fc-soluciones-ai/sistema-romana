import { useState, type Dispatch, type FormEvent, type SetStateAction } from 'react'
import { completados, formatoColones, formatoKg, nuevoId, pesoPagable, totalPagar } from '../calculos'
import type { Datos } from '../types'

interface Props {
  datos: Datos
  setDatos: Dispatch<SetStateAction<Datos>>
}

const vacio = { nombre: '', cedula: '', telefono: '' }

export function Proveedores({ datos, setDatos }: Props) {
  const [nuevo, setNuevo] = useState(vacio)
  const [error, setError] = useState('')
  const compras = completados(datos).filter((p) => p.tipo === 'compra')

  function agregar(e: FormEvent) {
    e.preventDefault()
    if (!nuevo.nombre.trim() || !nuevo.cedula.trim()) {
      setError('El nombre y la cédula son obligatorios.')
      return
    }
    if (datos.proveedores.some((x) => x.cedula === nuevo.cedula.trim())) {
      setError('Ya existe un vendedor con esa cédula.')
      return
    }
    setDatos((d) => ({
      ...d,
      proveedores: [
        ...d.proveedores,
        { id: nuevoId(), nombre: nuevo.nombre.trim(), cedula: nuevo.cedula.trim(), telefono: nuevo.telefono.trim() },
      ],
    }))
    setNuevo(vacio)
    setError('')
  }

  return (
    <div className="columnas">
      <section className="tarjeta">
        <h2>Vendedores de chatarra</h2>
        <table className="tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Cédula</th>
              <th>Teléfono</th>
              <th className="num">Compras</th>
              <th className="num">Kg vendidos</th>
              <th className="num">Total pagado</th>
            </tr>
          </thead>
          <tbody>
            {datos.proveedores.map((x) => {
              const suyas = compras.filter((p) => p.proveedorId === x.id)
              return (
                <tr key={x.id}>
                  <td>{x.nombre}</td>
                  <td>{x.cedula}</td>
                  <td>{x.telefono}</td>
                  <td className="num">{suyas.length}</td>
                  <td className="num">{formatoKg(suyas.reduce((s, p) => s + pesoPagable(p), 0))}</td>
                  <td className="num">{formatoColones(suyas.reduce((s, p) => s + totalPagar(p), 0))}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>

      <form className="tarjeta" onSubmit={agregar}>
        <h2>Nuevo vendedor</h2>
        <div className="formulario una-columna">
          <label>
            Nombre o razón social *
            <input value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} />
          </label>
          <label>
            Cédula física o jurídica *
            <input
              placeholder="1-1234-0567"
              value={nuevo.cedula}
              onChange={(e) => setNuevo({ ...nuevo, cedula: e.target.value })}
            />
          </label>
          <label>
            Teléfono
            <input value={nuevo.telefono} onChange={(e) => setNuevo({ ...nuevo, telefono: e.target.value })} />
          </label>
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="boton primario">
          Agregar vendedor
        </button>
      </form>
    </div>
  )
}

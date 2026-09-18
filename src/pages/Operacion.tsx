import { useState, type Dispatch, type SetStateAction } from 'react'
import { existencias, formatoColones, formatoFecha, formatoKg, nuevoId } from '../calculos'
import { Romana, type OpcionSimulacion } from '../components/Romana'
import type { Datos, Pesaje, TipoPesaje } from '../types'

interface Props {
  tipo: TipoPesaje
  datos: Datos
  setDatos: Dispatch<SetStateAction<Datos>>
  verBoleta: (p: Pesaje) => void
}

const aleatorio = (min: number, max: number) => min + Math.random() * (max - min)

const formularioVacio = {
  placa: '',
  conductor: '',
  proveedorId: '',
  materialId: '',
  contenedor: '',
  marchamo: '',
  notas: '',
}

export function Operacion({ tipo, datos, setDatos, verBoleta }: Props) {
  const esCompra = tipo === 'compra'
  const [form, setForm] = useState(formularioVacio)
  const [salidaId, setSalidaId] = useState<string | null>(null)
  const [rebajoPct, setRebajoPct] = useState(0)
  const [error, setError] = useState('')

  const enPatio = datos.pesajes.filter((p) => p.tipo === tipo && p.estado === 'en_patio')
  const enSalida = enPatio.find((p) => p.id === salidaId)
  const nombreMaterial = (id: string) => datos.materiales.find((m) => m.id === id)?.nombre ?? '—'
  const nombreProveedor = (id?: string) => datos.proveedores.find((x) => x.id === id)?.nombre ?? '—'
  const existenciaDe = (materialId: string) =>
    existencias(datos).find((e) => e.materialId === materialId)?.existenciaKg ?? 0

  const campo = (nombre: keyof typeof formularioVacio) => ({
    value: form[nombre],
    onChange: (e: { target: { value: string } }) => setForm({ ...form, [nombre]: e.target.value }),
  })

  const opciones: OpcionSimulacion[] = enSalida
    ? [
        esCompra
          ? { etiqueta: 'Camión descargado', peso: () => enSalida.pesoEntrada * aleatorio(0.4, 0.6) }
          : {
              etiqueta: 'Camión cargado',
              peso: () =>
                enSalida.pesoEntrada +
                Math.min(aleatorio(18_000, 26_000), Math.max(existenciaDe(enSalida.materialId), 0)),
            },
      ]
    : [
        esCompra
          ? { etiqueta: 'Llega camión cargado', peso: () => aleatorio(12_000, 32_000) }
          : { etiqueta: 'Llega camión vacío', peso: () => aleatorio(12_000, 16_000) },
      ]

  function registrarEntrada(peso: number): boolean {
    const faltantes = [
      !form.placa.trim() && 'placa',
      !form.materialId && 'material',
      esCompra && !form.proveedorId && 'vendedor',
    ].filter(Boolean)
    if (faltantes.length) {
      setError(`Falta indicar: ${faltantes.join(', ')}.`)
      return false
    }
    const pesaje: Pesaje = {
      id: nuevoId(),
      boleta: datos.siguienteBoleta,
      tipo,
      estado: 'en_patio',
      placa: form.placa.trim().toUpperCase(),
      conductor: form.conductor.trim(),
      materialId: form.materialId,
      proveedorId: esCompra ? form.proveedorId : undefined,
      contenedor: esCompra ? undefined : form.contenedor.trim().toUpperCase(),
      marchamo: esCompra ? undefined : form.marchamo.trim().toUpperCase(),
      pesoEntrada: peso,
      fechaEntrada: new Date().toISOString(),
      rebajoPct: 0,
      precioKg: 0,
      notas: form.notas.trim(),
    }
    setDatos((d) => ({ ...d, pesajes: [...d.pesajes, pesaje], siguienteBoleta: d.siguienteBoleta + 1 }))
    setForm(formularioVacio)
    setError('')
    return true
  }

  function registrarSalida(peso: number): boolean {
    if (!enSalida) return false
    if (esCompra && peso >= enSalida.pesoEntrada) {
      setError('La tara debe ser menor que el peso de entrada. Descargue el camión antes de pesar.')
      return false
    }
    if (!esCompra && peso <= enSalida.pesoEntrada) {
      setError('El peso cargado debe ser mayor que el peso de entrada (camión vacío).')
      return false
    }
    if (!esCompra && peso - enSalida.pesoEntrada > existenciaDe(enSalida.materialId)) {
      setError(
        `La carga supera la existencia de ${nombreMaterial(enSalida.materialId)} ` +
          `(${formatoKg(existenciaDe(enSalida.materialId))}).`,
      )
      return false
    }
    const precioKg = esCompra
      ? (datos.materiales.find((m) => m.id === enSalida.materialId)?.precioKg ?? 0)
      : 0
    const completo: Pesaje = {
      ...enSalida,
      estado: 'completado',
      pesoSalida: peso,
      fechaSalida: new Date().toISOString(),
      rebajoPct: esCompra ? rebajoPct : 0,
      precioKg,
    }
    setDatos((d) => ({ ...d, pesajes: d.pesajes.map((p) => (p.id === completo.id ? completo : p)) }))
    setSalidaId(null)
    setRebajoPct(0)
    setError('')
    verBoleta(completo)
    return true
  }

  return (
    <div className="operacion">
      <section className="tarjeta">
        <Romana
          opciones={opciones}
          textoCaptura={
            enSalida
              ? `Capturar ${esCompra ? 'tara' : 'peso cargado'} · boleta ${enSalida.boleta}`
              : `Capturar peso de entrada`
          }
          onCapturar={enSalida ? registrarSalida : registrarEntrada}
        />
      </section>

      <section className="tarjeta">
        {enSalida ? (
          <>
            <h2>Salida · boleta {enSalida.boleta}</h2>
            <dl className="resumen-salida">
              <dt>Placa</dt>
              <dd>{enSalida.placa}</dd>
              <dt>{esCompra ? 'Vendedor' : 'Contenedor'}</dt>
              <dd>{esCompra ? nombreProveedor(enSalida.proveedorId) : enSalida.contenedor || '—'}</dd>
              <dt>Material</dt>
              <dd>{nombreMaterial(enSalida.materialId)}</dd>
              <dt>Peso de entrada</dt>
              <dd>{formatoKg(enSalida.pesoEntrada)}</dd>
              {esCompra && (
                <>
                  <dt>Precio vigente</dt>
                  <dd>
                    {formatoColones(datos.materiales.find((m) => m.id === enSalida.materialId)?.precioKg ?? 0)} / kg
                  </dd>
                </>
              )}
            </dl>
            {esCompra && (
              <label>
                Rebajo por impurezas o humedad (%)
                <input
                  type="number"
                  min={0}
                  max={50}
                  step={0.5}
                  value={rebajoPct}
                  onChange={(e) => setRebajoPct(Math.min(50, Math.max(0, Number(e.target.value))))}
                />
              </label>
            )}
            <p className="ayuda">
              {esCompra
                ? 'Con el camión ya descargado sobre la romana, capture la tara.'
                : 'Con el camión cargado sobre la romana, capture el peso.'}
            </p>
            <button type="button" className="boton" onClick={() => { setSalidaId(null); setError('') }}>
              Cancelar salida
            </button>
          </>
        ) : (
          <>
            <h2>{esCompra ? 'Entrada de camión con chatarra' : `Carga para ${datos.config.exportador}`}</h2>
            <div className="formulario">
              <label>
                Placa *
                <input placeholder="C-123456" {...campo('placa')} />
              </label>
              <label>
                Conductor
                <input {...campo('conductor')} />
              </label>
              {esCompra && (
                <label>
                  Vendedor *
                  <select {...campo('proveedorId')}>
                    <option value="">Seleccione…</option>
                    {datos.proveedores.map((x) => (
                      <option key={x.id} value={x.id}>
                        {x.nombre} · {x.cedula}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <label>
                Material *
                <select {...campo('materialId')}>
                  <option value="">Seleccione…</option>
                  {datos.materiales.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre}
                      {!esCompra && ` · existencia ${formatoKg(existenciaDe(m.id))}`}
                    </option>
                  ))}
                </select>
              </label>
              {!esCompra && (
                <>
                  <label>
                    Contenedor
                    <input placeholder="MSKU 123456-7" {...campo('contenedor')} />
                  </label>
                  <label>
                    Marchamo
                    <input {...campo('marchamo')} />
                  </label>
                </>
              )}
              <label className="ancho">
                Notas
                <input {...campo('notas')} />
              </label>
            </div>
            <p className="ayuda">
              {esCompra
                ? 'Con el camión cargado sobre la romana, capture el peso de entrada.'
                : 'Con el camión vacío sobre la romana, capture el peso de entrada.'}
            </p>
          </>
        )}
        {error && <p className="error">{error}</p>}
      </section>

      <section className="tarjeta ancho-completo">
        <h2>Camiones en patio ({enPatio.length})</h2>
        {enPatio.length === 0 ? (
          <p className="vacio">No hay camiones esperando salida.</p>
        ) : (
          <table className="tabla">
            <thead>
              <tr>
                <th>Boleta</th>
                <th>Entrada</th>
                <th>Placa</th>
                <th>{esCompra ? 'Vendedor' : 'Contenedor'}</th>
                <th>Material</th>
                <th className="num">Peso entrada</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {enPatio.map((p) => (
                <tr key={p.id} className={p.id === salidaId ? 'seleccionada' : ''}>
                  <td>{p.boleta}</td>
                  <td>{formatoFecha(p.fechaEntrada)}</td>
                  <td>{p.placa}</td>
                  <td>{esCompra ? nombreProveedor(p.proveedorId) : p.contenedor || '—'}</td>
                  <td>{nombreMaterial(p.materialId)}</td>
                  <td className="num">{formatoKg(p.pesoEntrada)}</td>
                  <td className="acciones">
                    <button type="button" className="boton primario" onClick={() => { setSalidaId(p.id); setError('') }}>
                      Registrar salida
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}

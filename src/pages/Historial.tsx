import { useState, type Dispatch, type SetStateAction } from 'react'
import { fechaLocal, formatoColones, formatoFecha, formatoKg, pesoNeto, pesoPagable, totalPagar } from '../calculos'
import type { Datos, Pesaje } from '../types'

interface Props {
  datos: Datos
  setDatos: Dispatch<SetStateAction<Datos>>
  verBoleta: (p: Pesaje) => void
}

const ESTADOS: Record<Pesaje['estado'], string> = {
  en_patio: 'En patio',
  completado: 'Completado',
  anulado: 'Anulado',
}

function descargarCsv(nombre: string, filas: (string | number)[][]) {
  const texto = filas
    .map((f) => f.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(';'))
    .join('\r\n')
  const url = URL.createObjectURL(new Blob(['﻿' + texto], { type: 'text/csv;charset=utf-8' }))
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombre
  enlace.click()
  URL.revokeObjectURL(url)
}

export function Historial({ datos, setDatos, verBoleta }: Props) {
  const [tipo, setTipo] = useState('')
  const [materialId, setMaterialId] = useState('')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [buscar, setBuscar] = useState('')

  const material = (id: string) => datos.materiales.find((m) => m.id === id)?.nombre ?? '—'
  const contraparte = (p: Pesaje) =>
    p.tipo === 'compra'
      ? (datos.proveedores.find((x) => x.id === p.proveedorId)?.nombre ?? '—')
      : datos.config.exportador

  const texto = buscar.trim().toLowerCase()
  const filtrados = datos.pesajes
    .filter((p) => !tipo || p.tipo === tipo)
    .filter((p) => !materialId || p.materialId === materialId)
    .filter((p) => !desde || fechaLocal(p.fechaEntrada) >= desde)
    .filter((p) => !hasta || fechaLocal(p.fechaEntrada) <= hasta)
    .filter(
      (p) =>
        !texto ||
        [String(p.boleta), p.placa, p.conductor, contraparte(p), p.contenedor ?? '']
          .some((v) => v.toLowerCase().includes(texto)),
    )
    .sort((a, b) => b.boleta - a.boleta)

  const validos = filtrados.filter((p) => p.estado === 'completado')
  const totalKgCompra = validos.filter((p) => p.tipo === 'compra').reduce((s, p) => s + pesoPagable(p), 0)
  const totalKgDespacho = validos.filter((p) => p.tipo === 'despacho').reduce((s, p) => s + pesoPagable(p), 0)
  const totalColones = validos.reduce((s, p) => s + totalPagar(p), 0)

  function anular(p: Pesaje) {
    if (!window.confirm(`¿Anular la boleta ${p.boleta}? Quedará marcada como anulada y no contará en los totales.`)) return
    setDatos((d) => ({
      ...d,
      pesajes: d.pesajes.map((x) => (x.id === p.id ? { ...x, estado: 'anulado' } : x)),
    }))
  }

  function exportar() {
    descargarCsv('pesajes.csv', [
      ['Boleta', 'Tipo', 'Estado', 'Entrada', 'Salida', 'Placa', 'Conductor', 'Vendedor/Exportador',
        'Material', 'Peso entrada', 'Peso salida', 'Neto kg', 'Rebajo %', 'Kg pagables', 'Precio kg', 'Total ₡'],
      ...filtrados.map((p) => [
        p.boleta, p.tipo, ESTADOS[p.estado], p.fechaEntrada, p.fechaSalida ?? '', p.placa, p.conductor,
        contraparte(p), material(p.materialId), p.pesoEntrada, p.pesoSalida ?? '', pesoNeto(p),
        p.rebajoPct, pesoPagable(p), p.precioKg, totalPagar(p),
      ]),
    ])
  }

  return (
    <section className="tarjeta">
      <div className="filtros">
        <label>
          Tipo
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="">Todos</option>
            <option value="compra">Compras</option>
            <option value="despacho">Despachos</option>
          </select>
        </label>
        <label>
          Material
          <select value={materialId} onChange={(e) => setMaterialId(e.target.value)}>
            <option value="">Todos</option>
            {datos.materiales.map((m) => (
              <option key={m.id} value={m.id}>{m.nombre}</option>
            ))}
          </select>
        </label>
        <label>
          Desde
          <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        </label>
        <label>
          Hasta
          <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </label>
        <label className="crece">
          Buscar
          <input placeholder="Boleta, placa, vendedor…" value={buscar} onChange={(e) => setBuscar(e.target.value)} />
        </label>
        <button type="button" className="boton" onClick={exportar}>
          Exportar a Excel (CSV)
        </button>
      </div>

      <div className="totales">
        <span>Comprado: <strong>{formatoKg(totalKgCompra)}</strong></span>
        <span>Despachado: <strong>{formatoKg(totalKgDespacho)}</strong></span>
        <span>Pagado: <strong>{formatoColones(totalColones)}</strong></span>
        <span className="tenue">Totales sin boletas anuladas ni en patio</span>
      </div>

      <div className="tabla-contenedor">
        <table className="tabla">
          <thead>
            <tr>
              <th>Boleta</th>
              <th>Tipo</th>
              <th>Fecha</th>
              <th>Placa</th>
              <th>Vendedor / Exportador</th>
              <th>Material</th>
              <th className="num">Neto</th>
              <th className="num">Kg pagables</th>
              <th className="num">Total</th>
              <th>Estado</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtrados.map((p) => (
              <tr key={p.id} className={p.estado === 'anulado' ? 'anulada' : ''}>
                <td>{p.boleta}</td>
                <td>
                  <span className={`etiqueta ${p.tipo}`}>{p.tipo === 'compra' ? 'Compra' : 'Despacho'}</span>
                </td>
                <td>{formatoFecha(p.fechaEntrada)}</td>
                <td>{p.placa}</td>
                <td>{contraparte(p)}</td>
                <td>{material(p.materialId)}</td>
                <td className="num">{p.estado === 'en_patio' ? '—' : formatoKg(pesoNeto(p))}</td>
                <td className="num">{p.estado === 'en_patio' ? '—' : formatoKg(pesoPagable(p))}</td>
                <td className="num">{p.tipo === 'compra' && p.estado !== 'en_patio' ? formatoColones(totalPagar(p)) : '—'}</td>
                <td>
                  <span className={`estado ${p.estado}`}>{ESTADOS[p.estado]}</span>
                </td>
                <td className="acciones">
                  <button type="button" className="boton chico" onClick={() => verBoleta(p)}>
                    Boleta
                  </button>
                  {p.estado !== 'anulado' && (
                    <button type="button" className="boton chico peligro" onClick={() => anular(p)}>
                      Anular
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtrados.length === 0 && <p className="vacio">No hay pesajes con esos filtros.</p>}
      </div>
    </section>
  )
}

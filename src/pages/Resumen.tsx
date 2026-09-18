import {
  completados,
  esHoy,
  existencias,
  formatoColones,
  formatoFecha,
  formatoKg,
  pesoPagable,
  totalPagar,
} from '../calculos'
import type { Datos, Pesaje } from '../types'

interface Props {
  datos: Datos
  verBoleta: (p: Pesaje) => void
}

export function Resumen({ datos, verBoleta }: Props) {
  const hechos = completados(datos)
  const comprasHoy = hechos.filter((p) => p.tipo === 'compra' && p.fechaSalida && esHoy(p.fechaSalida))
  const enPatio = datos.pesajes.filter((p) => p.estado === 'en_patio')
  const inventario = existencias(datos)
  const maxExistencia = Math.max(1, ...inventario.map((e) => e.existenciaKg))
  const ultimos = [...hechos]
    .sort((a, b) => (b.fechaSalida ?? '').localeCompare(a.fechaSalida ?? ''))
    .slice(0, 6)
  const material = (id: string) => datos.materiales.find((m) => m.id === id)?.nombre ?? '—'

  const kpis = [
    { titulo: 'Comprado hoy', valor: formatoKg(comprasHoy.reduce((s, p) => s + pesoPagable(p), 0)) },
    { titulo: 'Pagado hoy', valor: formatoColones(comprasHoy.reduce((s, p) => s + totalPagar(p), 0)) },
    { titulo: 'Compras hoy', valor: String(comprasHoy.length) },
    { titulo: 'Camiones en patio', valor: String(enPatio.length) },
  ]

  return (
    <div className="resumen">
      <div className="kpis">
        {kpis.map((k) => (
          <div key={k.titulo} className="tarjeta kpi">
            <span className="kpi-titulo">{k.titulo}</span>
            <span className="kpi-valor">{k.valor}</span>
          </div>
        ))}
      </div>

      <section className="tarjeta">
        <h2>Inventario en patio</h2>
        <p className="tenue">Comprado menos despachado a {datos.config.exportador}.</p>
        <div className="inventario">
          {inventario.map((e) => {
            const costoPromedio = e.compradoKg > 0 ? e.costoTotal / e.compradoKg : 0
            return (
              <div key={e.materialId} className="inventario-fila">
                <div className="inventario-cabeza">
                  <strong>{material(e.materialId)}</strong>
                  <span>{formatoKg(e.existenciaKg)}</span>
                </div>
                <div className="barra">
                  <div
                    className={`barra-relleno ${e.materialId}`}
                    style={{ width: `${(Math.max(e.existenciaKg, 0) / maxExistencia) * 100}%` }}
                  />
                </div>
                <div className="inventario-detalle">
                  <span>Comprado {formatoKg(e.compradoKg)}</span>
                  <span>Despachado {formatoKg(e.despachadoKg)}</span>
                  <span>Costo promedio {formatoColones(costoPromedio)}/kg</span>
                  <span>
                    Valor en patio {formatoColones(Math.max(e.existenciaKg, 0) * costoPromedio)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="tarjeta">
        <h2>Últimos movimientos</h2>
        <table className="tabla">
          <thead>
            <tr>
              <th>Boleta</th>
              <th>Salida</th>
              <th>Tipo</th>
              <th>Material</th>
              <th className="num">Kg</th>
              <th className="num">Total</th>
            </tr>
          </thead>
          <tbody>
            {ultimos.map((p) => (
              <tr key={p.id} className="clicable" onClick={() => verBoleta(p)}>
                <td>{p.boleta}</td>
                <td>{p.fechaSalida && formatoFecha(p.fechaSalida)}</td>
                <td>
                  <span className={`etiqueta ${p.tipo}`}>{p.tipo === 'compra' ? 'Compra' : 'Despacho'}</span>
                </td>
                <td>{material(p.materialId)}</td>
                <td className="num">{formatoKg(pesoPagable(p))}</td>
                <td className="num">{p.tipo === 'compra' ? formatoColones(totalPagar(p)) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

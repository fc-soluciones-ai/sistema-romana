import {
  formatoColones,
  formatoFecha,
  formatoKg,
  pesoBruto,
  pesoNeto,
  pesoPagable,
  pesoTara,
  rebajoKg,
  totalPagar,
} from '../calculos'
import type { Datos, Pesaje } from '../types'

interface Props {
  pesaje: Pesaje
  datos: Datos
  onCerrar: () => void
}

export function Boleta({ pesaje: p, datos, onCerrar }: Props) {
  const { config } = datos
  const material = datos.materiales.find((m) => m.id === p.materialId)
  const proveedor = datos.proveedores.find((x) => x.id === p.proveedorId)
  const esCompra = p.tipo === 'compra'

  return (
    <div className="modal-fondo" onClick={onCerrar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="boleta" id="boleta-imprimible">
          <header className="boleta-encabezado">
            <strong>{config.nombreEmpresa}</strong>
            <span>Céd. jurídica {config.cedulaJuridica}</span>
            <span>{config.direccion} · Tel. {config.telefono}</span>
          </header>

          <h2 className="boleta-titulo">
            {esCompra ? 'Boleta de compra' : 'Boleta de despacho'} N.º {p.boleta}
            {p.estado === 'anulado' && <span className="sello-anulado">ANULADA</span>}
          </h2>

          <dl className="boleta-datos">
            {esCompra ? (
              <>
                <dt>Vendedor</dt>
                <dd>{proveedor?.nombre ?? '—'}</dd>
                <dt>Cédula</dt>
                <dd>{proveedor?.cedula ?? '—'}</dd>
              </>
            ) : (
              <>
                <dt>Exportador</dt>
                <dd>{config.exportador}</dd>
                <dt>Contenedor</dt>
                <dd>{p.contenedor || '—'}</dd>
                <dt>Marchamo</dt>
                <dd>{p.marchamo || '—'}</dd>
              </>
            )}
            <dt>Placa</dt>
            <dd>{p.placa}</dd>
            <dt>Conductor</dt>
            <dd>{p.conductor || '—'}</dd>
            <dt>Material</dt>
            <dd>{material?.nombre ?? '—'}</dd>
            <dt>Entrada</dt>
            <dd>{formatoFecha(p.fechaEntrada)}</dd>
            <dt>Salida</dt>
            <dd>{p.fechaSalida ? formatoFecha(p.fechaSalida) : 'Camión en patio'}</dd>
          </dl>

          <table className="boleta-pesos">
            <tbody>
              <tr>
                <td>Peso bruto</td>
                <td>{formatoKg(pesoBruto(p) ?? p.pesoEntrada)}</td>
              </tr>
              <tr>
                <td>Tara</td>
                <td>{pesoTara(p) === undefined ? 'Pendiente' : formatoKg(pesoTara(p)!)}</td>
              </tr>
              {p.diferenciaTaraKg !== undefined && (
                <tr className="aviso-boleta">
                  <td>Tara fuera de la registrada</td>
                  <td>
                    {p.diferenciaTaraKg > 0 ? '+' : '−'}
                    {formatoKg(Math.abs(p.diferenciaTaraKg))}
                  </td>
                </tr>
              )}
              <tr className="fuerte">
                <td>Peso neto</td>
                <td>{formatoKg(pesoNeto(p))}</td>
              </tr>
              {esCompra && (
                <>
                  <tr>
                    <td>Rebajo por impurezas ({p.rebajoPct} %)</td>
                    <td>− {formatoKg(rebajoKg(p))}</td>
                  </tr>
                  <tr className="fuerte">
                    <td>Peso a pagar</td>
                    <td>{formatoKg(pesoPagable(p))}</td>
                  </tr>
                  <tr>
                    <td>Precio por kg</td>
                    <td>{formatoColones(p.precioKg)}</td>
                  </tr>
                  <tr className="total">
                    <td>Total a pagar</td>
                    <td>{formatoColones(totalPagar(p))}</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>

          {p.notas && <p className="boleta-notas">Notas: {p.notas}</p>}

          <div className="firmas">
            <span>Pesador</span>
            <span>{esCompra ? 'Vendedor' : 'Transportista'}</span>
          </div>
        </div>

        <div className="modal-acciones">
          <button type="button" className="boton" onClick={onCerrar}>
            Cerrar
          </button>
          <button type="button" className="boton primario" onClick={() => window.print()}>
            Imprimir
          </button>
        </div>
      </div>
    </div>
  )
}

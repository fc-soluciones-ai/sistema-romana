import type { Datos, Pesaje } from './types'

const colones = new Intl.NumberFormat('es-CR', {
  style: 'currency',
  currency: 'CRC',
  maximumFractionDigits: 0,
})
const kilos = new Intl.NumberFormat('es-CR', { maximumFractionDigits: 0 })
const fechaHora = new Intl.DateTimeFormat('es-CR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

export const formatoColones = (monto: number) => colones.format(monto)
export const formatoKg = (kg: number) => `${kilos.format(kg)} kg`
export const formatoFecha = (iso: string) => fechaHora.format(new Date(iso))

/** Fecha local en formato AAAA-MM-DD. */
export function fechaLocal(iso: string): string {
  const d = new Date(iso)
  const dos = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`
}

export const esHoy = (iso: string) =>
  new Date(iso).toDateString() === new Date().toDateString()

export function pesoBruto(p: Pesaje): number | undefined {
  if (p.pesoSalida === undefined) return undefined
  return p.tipo === 'compra' ? p.pesoEntrada : p.pesoSalida
}

export function pesoTara(p: Pesaje): number | undefined {
  if (p.pesoSalida === undefined) return undefined
  return p.tipo === 'compra' ? p.pesoSalida : p.pesoEntrada
}

export function pesoNeto(p: Pesaje): number {
  const bruto = pesoBruto(p)
  const tara = pesoTara(p)
  if (bruto === undefined || tara === undefined) return 0
  return bruto - tara
}

export function rebajoKg(p: Pesaje): number {
  return Math.round((pesoNeto(p) * p.rebajoPct) / 100)
}

/** Kilos que se pagan (compra) o que salen del inventario (despacho). */
export function pesoPagable(p: Pesaje): number {
  return pesoNeto(p) - rebajoKg(p)
}

export function totalPagar(p: Pesaje): number {
  if (p.tipo !== 'compra') return 0
  return Math.round(pesoPagable(p) * p.precioKg)
}

export function completados(datos: Datos): Pesaje[] {
  return datos.pesajes.filter((p) => p.estado === 'completado')
}

export interface ExistenciaMaterial {
  materialId: string
  compradoKg: number
  despachadoKg: number
  existenciaKg: number
  costoTotal: number
}

export function existencias(datos: Datos): ExistenciaMaterial[] {
  const hechos = completados(datos)
  return datos.materiales.map((m) => {
    const delMaterial = hechos.filter((p) => p.materialId === m.id)
    const compras = delMaterial.filter((p) => p.tipo === 'compra')
    const compradoKg = compras.reduce((s, p) => s + pesoPagable(p), 0)
    const despachadoKg = delMaterial
      .filter((p) => p.tipo === 'despacho')
      .reduce((s, p) => s + pesoPagable(p), 0)
    return {
      materialId: m.id,
      compradoKg,
      despachadoKg,
      existenciaKg: compradoKg - despachadoKg,
      costoTotal: compras.reduce((s, p) => s + totalPagar(p), 0),
    }
  })
}

/** Un registro sin el campo `activo` se considera activo. */
export const estaActivo = (r: { activo?: boolean }) => r.activo !== false

/** Cuántas boletas usan un material o un vendedor; si hay alguna, el registro no se borra. */
export function usadoEn(datos: Datos, campo: 'materialId' | 'proveedorId' | 'vehiculoId' | 'conductorId', id: string): number {
  return datos.pesajes.filter((p) => p[campo] === id).length
}

export const nuevoId = () => crypto.randomUUID()

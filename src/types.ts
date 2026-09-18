export interface Material {
  id: string
  nombre: string
  /** Precio de compra en colones por kilogramo. */
  precioKg: number
  /** Rango de mercado de referencia, para orientar al pesador. */
  precioMin?: number
  precioMax?: number
  /** Un material con boletas no se borra: se desactiva. Sin el campo se asume activo. */
  activo?: boolean
}

export interface Proveedor {
  id: string
  nombre: string
  cedula: string
  telefono: string
  /** Un vendedor con boletas no se borra: se desactiva. Sin el campo se asume activo. */
  activo?: boolean
}

export interface Conductor {
  id: string
  nombre: string
  cedula: string
  licencia: string
  telefono: string
  activo?: boolean
}

export interface Vehiculo {
  id: string
  placa: string
  descripcion: string
  /** Tara registrada en kg; sirve de referencia contra el peso de salida. */
  taraKg?: number
  activo?: boolean
}

/**
 * compra:    el camión entra cargado (bruto) y sale vacío (tara).
 * despacho:  el camión del exportador entra vacío (tara) y sale cargado (bruto).
 */
export type TipoPesaje = 'compra' | 'despacho'

export type EstadoPesaje = 'en_patio' | 'completado' | 'anulado'

export interface Pesaje {
  id: string
  boleta: number
  tipo: TipoPesaje
  estado: EstadoPesaje
  placa: string
  conductor: string
  materialId: string
  /** Solo en compras. */
  proveedorId?: string
  vehiculoId?: string
  conductorId?: string
  /** Solo en despachos. */
  contenedor?: string
  marchamo?: string
  pesoEntrada: number
  fechaEntrada: string
  pesoSalida?: number
  fechaSalida?: string
  /** Porcentaje rebajado por impurezas o humedad (solo compras). */
  rebajoPct: number
  /** Precio por kg al momento de la compra. */
  precioKg: number
  notas: string
}

export interface Configuracion {
  nombreEmpresa: string
  cedulaJuridica: string
  direccion: string
  telefono: string
  exportador: string
}

export interface Datos {
  config: Configuracion
  materiales: Material[]
  proveedores: Proveedor[]
  conductores: Conductor[]
  vehiculos: Vehiculo[]
  pesajes: Pesaje[]
  siguienteBoleta: number
}

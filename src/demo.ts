import type { Datos, Pesaje, TipoPesaje } from './types'

// Precios de mercado de referencia. El precio inicial es el punto medio del rango
// y se ajusta en Configuración.
const materiales = [
  { id: 'cobre-limpio', nombre: 'Cobre limpio (primera)', precioKg: 3250, precioMin: 3000, precioMax: 3500 },
  { id: 'cobre-mezclado', nombre: 'Cobre mezclado (segunda)', precioKg: 2550, precioMin: 2300, precioMax: 2800 },
  { id: 'aluminio-grueso', nombre: 'Aluminio grueso / perfil limpio', precioKg: 850, precioMin: 700, precioMax: 1000 },
  { id: 'aluminio-sucio', nombre: 'Aluminio sucio / latas / radiadores', precioKg: 400, precioMin: 300, precioMax: 500 },
  { id: 'hierro-pesado', nombre: 'Hierro pesado / estructural', precioKg: 100, precioMin: 80, precioMax: 120 },
  { id: 'hierro-liviano', nombre: 'Hierro liviano / lámina', precioKg: 65, precioMin: 50, precioMax: 80 },
]

const proveedores = [
  { id: 'p1', nombre: 'Chatarrera Los Ángeles', cedula: '3-101-456789', telefono: '2222-1100' },
  { id: 'p2', nombre: 'José Mora Solís', cedula: '1-1234-0567', telefono: '8888-2233' },
  { id: 'p3', nombre: 'Transportes Vargas S.A.', cedula: '3-101-998877', telefono: '2450-7788' },
  { id: 'p4', nombre: 'María Jiménez Rojas', cedula: '2-0678-0912', telefono: '8701-4455' },
]

const conductores = [
  { id: 'c1', nombre: 'Luis Brenes Campos', cedula: '1-0789-0456', licencia: 'C1', telefono: '8712-3344' },
  { id: 'c2', nombre: 'José Mora Solís', cedula: '1-1234-0567', licencia: 'B3', telefono: '8888-2233' },
  { id: 'c3', nombre: 'Andrés Vargas Ruiz', cedula: '6-0345-0788', licencia: 'C2', telefono: '8654-9010' },
  { id: 'c4', nombre: 'María Jiménez Rojas', cedula: '2-0678-0912', licencia: 'B3', telefono: '8701-4455' },
  { id: 'c5', nombre: 'Carlos Quesada Mora', cedula: '3-0456-0123', licencia: 'C2', telefono: '8533-6677' },
]

const vehiculos = [
  { id: 'v1', placa: 'C-145872', descripcion: 'Cabezal con góndola', taraKg: 11_240 },
  { id: 'v2', placa: 'CL-298310', descripcion: 'Camión liviano cerrado', taraKg: 3_300 },
  { id: 'v3', placa: 'C-160455', descripcion: 'Cabezal con góndola', taraKg: 12_890 },
  { id: 'v4', placa: 'CL-310022', descripcion: 'Camión liviano de estacas', taraKg: 3_985 },
  { id: 'v5', placa: 'C-172001', descripcion: 'Cabezal con plataforma para contenedor', taraKg: 14_600 },
]

/** Días anteriores usan la hora indicada; los de hoy se ubican `hora` horas antes de ahora. */
function momento(dias: number, hora: number, minutos: number): string {
  const d = new Date()
  if (dias === 0) {
    d.setMinutes(d.getMinutes() - hora * 60 + minutos)
  } else {
    d.setDate(d.getDate() - dias)
    d.setHours(hora, minutos, 0, 0)
  }
  return d.toISOString()
}

interface Semilla {
  tipo: TipoPesaje
  dias: number
  hora: number
  placa: string
  conductor: string
  materialId: string
  proveedorId?: string
  contenedor?: string
  marchamo?: string
  entrada: number
  salida?: number
  rebajoPct?: number
}

const semillas: Semilla[] = [
  { tipo: 'compra', dias: 6, hora: 8, placa: 'C-145872', conductor: 'Luis Brenes', materialId: 'hierro-pesado', proveedorId: 'p1', entrada: 24_380, salida: 11_240, rebajoPct: 2 },
  { tipo: 'compra', dias: 6, hora: 10, placa: 'CL-298310', conductor: 'José Mora', materialId: 'cobre-limpio', proveedorId: 'p2', entrada: 4_120, salida: 3_310 },
  { tipo: 'compra', dias: 5, hora: 9, placa: 'C-160455', conductor: 'Andrés Vargas', materialId: 'hierro-pesado', proveedorId: 'p3', entrada: 29_760, salida: 12_880, rebajoPct: 3 },
  { tipo: 'compra', dias: 4, hora: 11, placa: 'CL-310022', conductor: 'María Jiménez', materialId: 'aluminio-grueso', proveedorId: 'p4', entrada: 5_430, salida: 3_980, rebajoPct: 1 },
  { tipo: 'compra', dias: 3, hora: 8, placa: 'C-145872', conductor: 'Luis Brenes', materialId: 'hierro-liviano', proveedorId: 'p1', entrada: 26_110, salida: 11_250, rebajoPct: 2 },
  { tipo: 'despacho', dias: 2, hora: 14, placa: 'C-172001', conductor: 'Carlos Quesada', materialId: 'hierro-pesado', contenedor: 'MSKU 482193-0', marchamo: 'CR-0045812', entrada: 14_600, salida: 38_920 },
  { tipo: 'compra', dias: 1, hora: 9, placa: 'C-160455', conductor: 'Andrés Vargas', materialId: 'hierro-pesado', proveedorId: 'p3', entrada: 27_940, salida: 12_900, rebajoPct: 2 },
  { tipo: 'compra', dias: 1, hora: 15, placa: 'CL-298310', conductor: 'José Mora', materialId: 'cobre-mezclado', proveedorId: 'p2', entrada: 3_980, salida: 3_300 },
  { tipo: 'compra', dias: 0, hora: 2, placa: 'CL-310022', conductor: 'María Jiménez', materialId: 'aluminio-sucio', proveedorId: 'p4', entrada: 4_870, salida: 3_990, rebajoPct: 1 },
  { tipo: 'compra', dias: 0, hora: 1, placa: 'C-145872', conductor: 'Luis Brenes', materialId: 'hierro-pesado', proveedorId: 'p1', entrada: 25_420 },
]

export function datosDemo(): Datos {
  const pesajes: Pesaje[] = semillas.map((s, i) => {
    const precioKg = materiales.find((m) => m.id === s.materialId)!.precioKg
    return {
      id: `demo-${i + 1}`,
      boleta: 1001 + i,
      tipo: s.tipo,
      estado: s.salida === undefined ? 'en_patio' : 'completado',
      placa: s.placa,
      conductor: conductores.find((c) => c.nombre.startsWith(s.conductor))?.nombre ?? s.conductor,
      materialId: s.materialId,
      proveedorId: s.proveedorId,
      vehiculoId: vehiculos.find((v) => v.placa === s.placa)?.id,
      conductorId: conductores.find((c) => c.nombre.startsWith(s.conductor))?.id,
      contenedor: s.contenedor,
      marchamo: s.marchamo,
      pesoEntrada: s.entrada,
      fechaEntrada: momento(s.dias, s.hora, 5),
      pesoSalida: s.salida,
      fechaSalida: s.salida === undefined ? undefined : momento(s.dias, s.hora, 40),
      rebajoPct: s.rebajoPct ?? 0,
      precioKg: s.tipo === 'compra' ? precioKg : 0,
      notas: '',
    }
  })

  return {
    config: {
      nombreEmpresa: 'Recicladora (nombre por definir)',
      cedulaJuridica: '3-101-000000',
      direccion: 'Costa Rica',
      telefono: '0000-0000',
      exportador: 'Exportador (por definir)',
    },
    materiales,
    proveedores,
    conductores,
    vehiculos,
    pesajes,
    siguienteBoleta: 1001 + pesajes.length,
  }
}

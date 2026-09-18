import type { Dispatch, SetStateAction } from 'react'
import {
  completados,
  estaActivo,
  formatoColones,
  formatoKg,
  nuevoId,
  pesoPagable,
  totalPagar,
  usadoEn,
} from '../calculos'
import { TablaRegistros, type FilaRegistro } from '../components/TablaRegistros'
import type { Conductor, Datos, Proveedor, Vehiculo } from '../types'

interface Props {
  datos: Datos
  setDatos: Dispatch<SetStateAction<Datos>>
}

const numeroOpcional = (texto?: string) =>
  texto === undefined || texto.trim() === '' ? undefined : Math.max(0, Number(texto))

export function Registros({ datos, setDatos }: Props) {
  const compras = completados(datos).filter((p) => p.tipo === 'compra')

  const fila = (
    r: { id: string; activo?: boolean },
    nombre: string,
    campo: 'proveedorId' | 'conductorId' | 'vehiculoId',
    valores: FilaRegistro['valores'],
  ): FilaRegistro => ({
    id: r.id,
    nombre,
    activo: estaActivo(r),
    boletas: usadoEn(datos, campo, r.id),
    valores,
  })

  // --- Vendedores ---

  const cambiarProveedor = (id: string, clave: string, valor: string) =>
    setDatos((d) => ({
      ...d,
      proveedores: d.proveedores.map((x) => (x.id === id ? { ...x, [clave]: valor } : x)),
    }))

  function agregarProveedor(v: Record<string, string>): string | null {
    const nombre = (v.nombre ?? '').trim()
    const cedula = (v.cedula ?? '').trim()
    if (!nombre || !cedula) return 'El nombre y la cédula son obligatorios.'
    if (datos.proveedores.some((x) => x.cedula === cedula)) return 'Ya existe un vendedor con esa cédula.'
    const proveedor: Proveedor = { id: nuevoId(), nombre, cedula, telefono: (v.telefono ?? '').trim() }
    setDatos((d) => ({ ...d, proveedores: [...d.proveedores, proveedor] }))
    return null
  }

  // --- Conductores ---

  const cambiarConductor = (id: string, clave: string, valor: string) =>
    setDatos((d) => ({
      ...d,
      conductores: d.conductores.map((x) => (x.id === id ? { ...x, [clave]: valor } : x)),
    }))

  function agregarConductor(v: Record<string, string>): string | null {
    const nombre = (v.nombre ?? '').trim()
    if (!nombre) return 'Escriba el nombre del conductor.'
    if (datos.conductores.some((x) => x.nombre.toLowerCase() === nombre.toLowerCase()))
      return 'Ya existe un conductor con ese nombre.'
    const conductor: Conductor = {
      id: nuevoId(),
      nombre,
      cedula: (v.cedula ?? '').trim(),
      licencia: (v.licencia ?? '').trim(),
      telefono: (v.telefono ?? '').trim(),
    }
    setDatos((d) => ({ ...d, conductores: [...d.conductores, conductor] }))
    return null
  }

  // --- Vehículos ---

  const cambiarVehiculo = (id: string, clave: string, valor: string) =>
    setDatos((d) => ({
      ...d,
      vehiculos: d.vehiculos.map((x) =>
        x.id === id ? { ...x, [clave]: clave === 'taraKg' ? numeroOpcional(valor) : valor } : x,
      ),
    }))

  function agregarVehiculo(v: Record<string, string>): string | null {
    const placa = (v.placa ?? '').trim().toUpperCase()
    if (!placa) return 'Escriba la placa del vehículo.'
    if (datos.vehiculos.some((x) => x.placa.toUpperCase() === placa)) return 'Ya existe un vehículo con esa placa.'
    const vehiculo: Vehiculo = {
      id: nuevoId(),
      placa,
      descripcion: (v.descripcion ?? '').trim(),
      taraKg: numeroOpcional(v.taraKg),
    }
    setDatos((d) => ({ ...d, vehiculos: [...d.vehiculos, vehiculo] }))
    return null
  }

  const activar = (lista: 'proveedores' | 'conductores' | 'vehiculos') => (id: string, activo: boolean) =>
    setDatos((d) => ({ ...d, [lista]: d[lista].map((x) => (x.id === id ? { ...x, activo } : x)) }))

  const eliminar = (lista: 'proveedores' | 'conductores' | 'vehiculos') => (id: string) =>
    setDatos((d) => ({ ...d, [lista]: d[lista].filter((x) => x.id !== id) }))

  return (
    <div className="registros">
      <TablaRegistros
        titulo="Vendedores de chatarra"
        descripcion="Quienes le venden material al negocio. Se edita cualquier dato en la misma tabla."
        columnas={[
          { clave: 'nombre', etiqueta: 'Nombre o razón social', placeholder: 'Nuevo vendedor' },
          { clave: 'cedula', etiqueta: 'Cédula', placeholder: '1-1234-0567' },
          { clave: 'telefono', etiqueta: 'Teléfono', placeholder: '8888-0000' },
        ]}
        columnasCalculadas={[
          { etiqueta: 'Compras', valor: (id) => compras.filter((p) => p.proveedorId === id).length },
          {
            etiqueta: 'Kg vendidos',
            valor: (id) =>
              formatoKg(compras.filter((p) => p.proveedorId === id).reduce((s, p) => s + pesoPagable(p), 0)),
          },
          {
            etiqueta: 'Total pagado',
            valor: (id) =>
              formatoColones(compras.filter((p) => p.proveedorId === id).reduce((s, p) => s + totalPagar(p), 0)),
          },
        ]}
        filas={datos.proveedores.map((x) =>
          fila(x, x.nombre, 'proveedorId', { nombre: x.nombre, cedula: x.cedula, telefono: x.telefono }),
        )}
        onCambiar={cambiarProveedor}
        onAgregar={agregarProveedor}
        onEliminar={eliminar('proveedores')}
        onActivar={activar('proveedores')}
      />

      <TablaRegistros
        titulo="Conductores"
        descripcion="Aparecen en la lista al registrar la entrada de un camión."
        columnas={[
          { clave: 'nombre', etiqueta: 'Nombre', placeholder: 'Nuevo conductor' },
          { clave: 'cedula', etiqueta: 'Cédula', placeholder: '1-1234-0567' },
          { clave: 'licencia', etiqueta: 'Licencia', corto: true, placeholder: 'C1' },
          { clave: 'telefono', etiqueta: 'Teléfono', placeholder: '8888-0000' },
        ]}
        columnasCalculadas={[
          {
            etiqueta: 'Pesajes',
            valor: (id) => datos.pesajes.filter((p) => p.conductorId === id).length,
          },
        ]}
        filas={datos.conductores.map((x) =>
          fila(x, x.nombre, 'conductorId', {
            nombre: x.nombre,
            cedula: x.cedula,
            licencia: x.licencia,
            telefono: x.telefono,
          }),
        )}
        onCambiar={cambiarConductor}
        onAgregar={agregarConductor}
        onEliminar={eliminar('conductores')}
        onActivar={activar('conductores')}
      />

      <TablaRegistros
        titulo="Vehículos"
        descripcion="La tara registrada sirve de referencia para comparar contra el peso de salida del camión."
        columnas={[
          { clave: 'placa', etiqueta: 'Placa', corto: true, placeholder: 'C-123456' },
          { clave: 'descripcion', etiqueta: 'Descripción', placeholder: 'Cabezal con góndola' },
          { clave: 'taraKg', etiqueta: 'Tara registrada (kg)', numero: true, paso: 10, placeholder: '0' },
        ]}
        columnasCalculadas={[
          { etiqueta: 'Pesajes', valor: (id) => datos.pesajes.filter((p) => p.vehiculoId === id).length },
        ]}
        filas={datos.vehiculos.map((x) =>
          fila(x, x.placa, 'vehiculoId', { placa: x.placa, descripcion: x.descripcion, taraKg: x.taraKg }),
        )}
        onCambiar={cambiarVehiculo}
        onAgregar={agregarVehiculo}
        onEliminar={eliminar('vehiculos')}
        onActivar={activar('vehiculos')}
      />
    </div>
  )
}

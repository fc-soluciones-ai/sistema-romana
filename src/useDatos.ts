import { useEffect, useState } from 'react'
import { datosDemo } from './demo'
import type { Datos } from './types'

// Prototipo: los datos viven en el navegador. En la versión final irán a una base de datos.
// Al cambiar la forma de los datos se sube la versión para descartar lo guardado antes.
const CLAVE = 'sistema-romana:v3'

function cargar(): Datos {
  try {
    const guardado = localStorage.getItem(CLAVE)
    if (guardado) return JSON.parse(guardado) as Datos
  } catch {
    // Almacenamiento no disponible o dañado: se usan los datos de demostración.
  }
  return datosDemo()
}

export function useDatos() {
  const [datos, setDatos] = useState<Datos>(cargar)

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(datos))
    } catch {
      // Sin almacenamiento el prototipo sigue funcionando en memoria.
    }
  }, [datos])

  const restablecer = () => setDatos(datosDemo())

  return { datos, setDatos, restablecer }
}

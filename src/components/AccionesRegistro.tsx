interface Props {
  nombre: string
  activo: boolean
  /** Cantidad de boletas que usan el registro. Con una o más, no se puede borrar. */
  boletas: number
  onEliminar: () => void
  onActivar: (activo: boolean) => void
}

/**
 * Acciones iguales para todas las tablas de registros: eliminar mientras no
 * tenga boletas, y desactivar o reactivar cuando ya las tiene.
 */
export function AccionesRegistro({ nombre, activo, boletas, onEliminar, onActivar }: Props) {
  if (boletas === 0) {
    return (
      <button
        type="button"
        className="boton chico peligro"
        onClick={() => window.confirm(`¿Eliminar "${nombre}"?`) && onEliminar()}
      >
        Eliminar
      </button>
    )
  }

  return (
    <button
      type="button"
      className={`boton chico ${activo ? 'peligro' : ''}`}
      title={`Tiene ${boletas} ${boletas === 1 ? 'boleta' : 'boletas'}, por eso no se puede eliminar.`}
      onClick={() => onActivar(!activo)}
    >
      {activo ? 'Desactivar' : 'Reactivar'}
    </button>
  )
}

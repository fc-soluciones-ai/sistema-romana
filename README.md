# Sistema de Romana

Prototipo de sistema para una romana caminera de un centro de compra de chatarra en Costa Rica.
El negocio compra hierro, cobre y aluminio —cada uno separado por estado, porque el precio
depende de eso— y exporta todo lo comprado a un único exportador.

> **Prototipo de demostración.** La báscula está simulada y los datos se guardan solo en el
> navegador (`localStorage`). El nombre de la empresa y el exportador son de ejemplo y se cambian
> en **Configuración**.

## Materiales y precios de referencia

| Material | Referencia de mercado (₡/kg) | Precio inicial |
| --- | --- | --- |
| Cobre limpio (primera) | 3 000 – 3 500 | 3 250 |
| Cobre mezclado (segunda) | 2 300 – 2 800 | 2 550 |
| Aluminio grueso / perfil limpio | 700 – 1 000 | 850 |
| Aluminio sucio / latas / radiadores | 300 – 500 | 400 |
| Hierro pesado / estructural | 80 – 120 | 100 |
| Hierro liviano / lámina | 50 – 80 | 65 |

El precio inicial es el punto medio del rango. Esta lista es solo el punto de partida: en
**Configuración** se agregan, editan y eliminan materiales (bronce, baterías, lo que compre el
negocio). Si el precio queda fuera de su rango de referencia, la casilla lo advierte pero igual
lo guarda.

### Regla para todas las tablas de registros

Materiales, vendedores, conductores y vehículos usan el mismo componente (`TablaRegistros`), se
editan directamente en su tabla y siguen la misma regla:

- **Sin boletas asociadas:** el registro se puede **eliminar**.
- **Con boletas asociadas:** se **desactiva** en lugar de borrarse. Deja de aparecer al pesar, pero
  las boletas viejas conservan su nombre y su precio. Se puede reactivar cuando se quiera.

## Funciones

| Sección | Qué hace |
| --- | --- |
| **Resumen** | Kilos comprados y colones pagados hoy, camiones en patio, inventario por material (comprado − despachado) con costo promedio y últimos movimientos. |
| **Compras** | Pesaje de entrada del camión cargado (bruto) y de salida vacío (tara). Calcula el peso neto, aplica el rebajo por impurezas, multiplica por el precio vigente y emite la boleta. |
| **Despachos** | Carga para el exportador: pesa el camión vacío y luego cargado, con contenedor y marchamo. No deja despachar más de lo que hay en inventario. |
| **Historial** | Todas las boletas, con filtros por tipo, material, fechas y búsqueda. Permite reimprimir, anular y exportar a CSV (Excel). |
| **Registros** | Tablas de vendedores, conductores y vehículos, editables en la misma fila. El vehículo guarda su tara registrada. |
| **Configuración** | Datos de la empresa para la boleta, nombre del exportador, alta y baja de materiales con su precio y rango, y restablecimiento de los datos de demostración. |

La boleta se imprime en formato de 80 mm para impresora térmica.

## Control de tara

Cuando el peso capturado es la tara del camión —la salida en una compra, la entrada en un
despacho— el sistema lo compara contra la tara registrada del vehículo. Si la diferencia supera la
tolerancia (2 % de fábrica, configurable), pide confirmación antes de emitir la boleta:

- **Volver a pesar:** no registra nada y el camión sigue en patio.
- **Aceptar la diferencia:** completa el pesaje y guarda la diferencia, que queda impresa en la
  boleta y marcada con **⚠ tara** en el historial.

Así el pesador no puede cerrar una boleta con una tara anormal sin dejar rastro.

## Ejecutar

```bash
npm install
npm run dev
```

Abrir http://localhost:5173. En **Compras** o **Despachos**, use los botones del *Simulador de
báscula* para simular un camión sobre la plataforma y capture el peso cuando el indicador marque
**ESTABLE**.

## Estructura

```
src/
  App.tsx              navegación entre secciones
  types.ts             modelo de datos
  calculos.ts          pesos neto/pagable, totales, inventario y formatos (₡, kg)
  demo.ts              datos de ejemplo
  useDatos.ts          persistencia en localStorage
  components/Romana.tsx  indicador de peso (simulado)
  components/Boleta.tsx  boleta imprimible
  components/TablaRegistros.tsx  tabla estándar de alta, edición y baja
  components/AccionesRegistro.tsx  regla de eliminar o desactivar
  pages/               Resumen, Operacion (compras y despachos), Historial, Registros, Configuracion
```

## Siguientes pasos si el cliente aprueba

- Leer el indicador real de la romana (puerto serie o red) en lugar del simulador.
- Base de datos y servidor para que varios equipos usen el sistema y no se pierdan datos.
- Usuarios y permisos (pesador, administrador), con bitácora de anulaciones.
- Fotos de placa y carga desde cámaras al capturar el peso.
- Precios con historial y cierre de caja diario.
- Revisar con el contador los requisitos de Hacienda (factura electrónica o comprobantes) para las compras y la exportación.

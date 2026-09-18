# Sistema de Romana

Prototipo de sistema para una romana caminera de un centro de compra de chatarra en Costa Rica.
El negocio compra hierro, cobre y aluminio y exporta todo lo comprado a un único exportador.

> **Prototipo de demostración.** La báscula está simulada y los datos se guardan solo en el
> navegador (`localStorage`). Los precios, el nombre de la empresa y el exportador son de ejemplo
> y se cambian en **Configuración**.

## Funciones

| Sección | Qué hace |
| --- | --- |
| **Resumen** | Kilos comprados y colones pagados hoy, camiones en patio, inventario por material (comprado − despachado) con costo promedio y últimos movimientos. |
| **Compras** | Pesaje de entrada del camión cargado (bruto) y de salida vacío (tara). Calcula el peso neto, aplica el rebajo por impurezas, multiplica por el precio vigente y emite la boleta. |
| **Despachos** | Carga para el exportador: pesa el camión vacío y luego cargado, con contenedor y marchamo. No deja despachar más de lo que hay en inventario. |
| **Historial** | Todas las boletas, con filtros por tipo, material, fechas y búsqueda. Permite reimprimir, anular y exportar a CSV (Excel). |
| **Vendedores** | Registro de vendedores de chatarra (nombre, cédula y teléfono), con sus totales vendidos. |
| **Configuración** | Datos de la empresa para la boleta, nombre del exportador, materiales y precios por kg, y restablecimiento de los datos de demostración. |

La boleta se imprime en formato de 80 mm para impresora térmica.

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
  pages/               Resumen, Operacion (compras y despachos), Historial, Proveedores, Configuracion
```

## Siguientes pasos si el cliente aprueba

- Leer el indicador real de la romana (puerto serie o red) en lugar del simulador.
- Base de datos y servidor para que varios equipos usen el sistema y no se pierdan datos.
- Usuarios y permisos (pesador, administrador), con bitácora de anulaciones.
- Fotos de placa y carga desde cámaras al capturar el peso.
- Precios con historial y cierre de caja diario.
- Revisar con el contador los requisitos de Hacienda (factura electrónica o comprobantes) para las compras y la exportación.

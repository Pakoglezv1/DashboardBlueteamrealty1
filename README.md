# Dashboard de Ventas — Blue Team Realty

Dashboard que lee en tiempo (casi) real desde un Google Sheet y muestra, por agente
y en global: leads atendidos, llamadas agendadas, visitas agendadas, cotizaciones
enviadas, rentas cerradas y ventas cerradas — filtrable por mes.

## Ya está creada la hoja de Google Sheets

Se creó en tu Drive: **"Registro de Ventas - Blue Team Realty"**
`https://docs.google.com/spreadsheets/d/11MfuU-R8fd4AMozsZW10PwOzfPJ9OFP1VzTmXMPf0Wg/edit`

Trae las columnas correctas y una fila de ejemplo en ceros para cada uno de los 10
vendedores (Vendedor 1 … Vendedor 10). **Cambia esos nombres por los reales** —
pero usa el mismo nombre exacto en todas las filas de esa persona (mayúsculas y
espacios incluidos), porque el dashboard agrupa por coincidencia exacta de texto.

## Paso obligatorio: compartir la hoja

El dashboard lee la hoja sin necesidad de que inicies sesión, pero para eso la hoja
tiene que estar compartida como pública para lectura:

1. Abre la hoja → botón **Compartir** (arriba a la derecha).
2. Cambia el acceso general a **"Cualquier persona con el enlace"** con rol **Lector**.
3. Guarda.

Sin este paso, el dashboard va a mostrar un error de "no se pudo leer la hoja".

## Cómo se registran los datos (formato de bitácora)

Cada fila es **un registro**, no un acumulado. Ejemplo: si Vendedor 3 atendió 4
leads y agendó 2 llamadas el 15 de septiembre, agrega una fila:

```
2026-09-15, Vendedor 3, 4, 2, 0, 0, 0, 0
```

Si el mismo día hace algo más, se agrega otra fila — el dashboard suma automáticamente
todas las filas del mes por agente. No hay que ir sumando a mano ni sobrescribir filas
anteriores.

## Publicarlo en GitHub

Misma mecánica que el generador de recibos:

1. Crea un repositorio nuevo en GitHub (o usa una carpeta dentro del mismo repo de recibos).
2. Sube `index.html`, la carpeta `css/` y la carpeta `js/` completas (con GitHub
   Desktop es más confiable que arrastrar archivos sueltos en la web).
3. Ve a **Settings → Pages**, selecciona rama `main` y carpeta `/(root)`, guarda.
4. Tu dashboard queda en `https://tu-usuario.github.io/tu-repo/`.

Para incrustarlo luego en el website:
```html
<iframe src="https://tu-usuario.github.io/tu-repo/" width="100%" height="900" style="border:none;"></iframe>
```

## Cambiar de hoja más adelante

En `js/script.js`, al inicio, está:

```js
const CONFIG = {
  SHEET_ID: "11MfuU-R8fd4AMozsZW10PwOzfPJ9OFP1VzTmXMPf0Wg",
  GID: "0",
  REFRESH_INTERVAL_MS: 60000,
};
```

`SHEET_ID` es la parte de la URL de la hoja entre `/d/` y `/edit`. `GID` es el número
de la pestaña (0 es la primera). Si mueves los datos a otra hoja, solo cambia esos
dos valores.

## Limitaciones a tener en cuenta

- El dashboard se actualiza solo (cada 60 segundos) mientras la pestaña esté abierta,
  y también al recargar la página — no es un socket en vivo, es una relectura periódica
  del CSV publicado de la hoja.
- La agrupación por agente depende de que el nombre esté escrito exactamente igual en
  cada fila. Si más adelante quieren evitar errores de dedo, se le puede agregar
  validación de datos (lista desplegable) directamente en Google Sheets.
- Esto reemplaza al spreadsheet de clientes del plan de CRM en función, no en propósito:
  ese sigue siendo para relación de clientes y propiedades; este es específicamente
  para actividad y desempeño de vendedores.

# Map Vue

Aplicación web de mapas construida con **Vue 3 + TypeScript + Vite**, utilizando **Mapbox GL JS** para la visualización del mapa y los servicios de geocodificación y rutas de Mapbox.

La aplicación permite obtener la ubicación actual del usuario, buscar lugares cercanos, visualizar resultados sobre el mapa y calcular una ruta en automóvil desde la ubicación del usuario hasta un lugar seleccionado.

## Características

- 📍 Obtención de la ubicación actual mediante la API de Geolocation del navegador.
- 🗺️ Visualización interactiva mediante Mapbox GL JS.
- 🔎 Búsqueda de lugares utilizando Mapbox Geocoding API.
- 📌 Marcadores para los resultados de búsqueda.
- 🧭 Centrado del mapa en la ubicación actual del usuario.
- 🚗 Cálculo de rutas de conducción entre dos puntos mediante Mapbox Directions API.
- 📏 Visualización de distancia estimada de la ruta.
- ⏱️ Visualización de duración estimada del trayecto.
- 🧵 Renderizado de la ruta como una línea GeoJSON sobre el mapa.
- 🧪 Pruebas unitarias para APIs, stores, componentes y utilidades.
- 🛠️ TypeScript, ESLint, Oxlint y Prettier para mantener la calidad del código.

## Stack tecnológico

| Tecnología                                            | Uso                        |
| ----------------------------------------------------- | -------------------------- |
| [Vue 3](https://vuejs.org/)                           | Framework de interfaz      |
| [TypeScript](https://www.typescriptlang.org/)         | Tipado estático            |
| [Vite](https://vite.dev/)                             | Desarrollo y build         |
| [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/) | Mapa, marcadores y rutas   |
| [Pinia](https://pinia.vuejs.org/)                     | Gestión del estado         |
| [Vue Router](https://router.vuejs.org/)               | Routing                    |
| [Vitest](https://vitest.dev/)                         | Pruebas                    |
| [Vue Test Utils](https://test-utils.vuejs.org/)       | Testing de componentes Vue |

## Requisitos

- **Node.js:** `22.18+` o `24.12+`
- **pnpm**
- Una cuenta de Mapbox y un **Access Token** válido.

## Instalación

Clona el repositorio y entra al proyecto:

```bash
git clone <URL_DEL_REPOSITORIO>
cd map-vue
```

Instala las dependencias:

```bash
pnpm install
```

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto a partir de `.env.template`:

```bash
cp .env.template .env
```

Configura tu token de Mapbox:

```env
VITE_MAPBOX_API_KEY=tu_token_de_mapbox
```

> **Importante:** no subas el archivo `.env.local` al repositorio. El proyecto utiliza la variable `VITE_MAPBOX_API_KEY` tanto para inicializar Mapbox GL JS como para realizar las peticiones a los servicios de búsqueda, reverse geocoding y directions.

## Desarrollo

Inicia el servidor de desarrollo:

```bash
pnpm dev
```

Vite mostrará la URL local donde estará disponible la aplicación.

## Build de producción

Para generar la versión de producción:

```bash
pnpm build
```

El comando ejecuta el chequeo de tipos y posteriormente el build de Vite.

Para previsualizar el build generado:

```bash
pnpm preview
```

## Testing

Ejecutar las pruebas en modo interactivo:

```bash
pnpm test
```

Ejecutar todas las pruebas una sola vez:

```bash
pnpm test:run
```

Generar el reporte de cobertura:

```bash
pnpm test:coverage
```

El proyecto incluye pruebas para:

- `directionsApi`
- `searchApi`
- `reverseGeocodingApi`
- `map store`
- `places store`
- `MapView`
- `MyLocationBtn`
- `createPlacePopupContent`

## Flujo principal de la aplicación

### 1. Ubicación inicial

Al cargar `HomeView`, el store de lugares solicita la ubicación mediante `navigator.geolocation.getCurrentPosition()`.

La posición se almacena como:

```text
[longitude, latitude]
```

Después se utiliza el servicio de **reverse geocoding** de Mapbox para obtener un nombre legible de la ubicación.

### 2. Búsqueda de lugares

El usuario introduce un término en `SearchBar`.

`SearchResults` utiliza el `placesStore` para consultar Mapbox Geocoding API, utilizando la ubicación actual como `proximity`. Los resultados se limitan a cinco lugares.

### 3. Marcadores

Cuando existen resultados, `mapStore.setPlacesMarkers()` elimina los marcadores anteriores y crea nuevos marcadores de Mapbox para cada resultado.

Cada marcador dispone de un popup con información del lugar.

### 4. Cálculo de ruta

Al seleccionar **Directions**, se solicita una ruta de conducción mediante Mapbox Directions API utilizando:

```text
ubicación_usuario;ubicación_destino
```

La respuesta proporciona la geometría de la ruta, distancia y duración.

### 5. Renderizado de la ruta

La geometría GeoJSON recibida se transforma en una fuente `LineString` de Mapbox y se dibuja sobre el mapa.

Al mismo tiempo, `TripDetails` muestra:

- Distancia en kilómetros.
- Duración estimada en minutos.

## Gestión del estado

El estado global se divide en dos stores de Pinia.

### `placesStore`

Gestiona información relacionada con lugares y ubicación del usuario:

- `userLocation`
- `userLocationName`
- `places`
- `isLoading`
- `isLoadingPlaces`

También contiene las acciones para:

- Obtener la ubicación inicial.
- Obtener el nombre de la ubicación mediante reverse geocoding.
- Buscar lugares.

### `mapStore`

Gestiona el estado y operaciones relacionadas con Mapbox:

- Instancia del mapa.
- Marcadores.
- Distancia de la ruta.
- Duración de la ruta.

También se encarga de:

- Crear y limpiar marcadores.
- Obtener rutas.
- Dibujar la polilínea de la ruta.
- Ajustar el viewport del mapa a la ruta.

## APIs utilizadas

### Mapbox Geocoding API

Utilizada para buscar lugares a partir de un término de búsqueda.

La búsqueda utiliza la ubicación actual como punto de proximidad para obtener resultados relevantes.

### Mapbox Reverse Geocoding API

Utilizada para convertir las coordenadas actuales del usuario en un nombre de ubicación legible.

### Mapbox Directions API

Utilizada para calcular rutas de conducción entre la ubicación del usuario y el destino seleccionado.

La aplicación solicita la geometría en formato GeoJSON para poder representarla directamente sobre Mapbox.

## Seguridad

El token se consume desde una variable de entorno:

```env
VITE_MAPBOX_API_KEY=...
```

Ten en cuenta que las variables con prefijo `VITE_` son expuestas al código del navegador durante el build. Por ello, el token utilizado por una aplicación frontend debe estar configurado con las restricciones y permisos adecuados en Mapbox.

## Compatibilidad

La aplicación requiere un navegador que soporte la **Geolocation API**. Si el navegador no proporciona `navigator.geolocation`, la aplicación detiene la inicialización mostrando un error.

Además, el navegador debe permitir el acceso a la ubicación para que las funcionalidades dependientes de la posición actual funcionen correctamente.

## Licencia

Este proyecto no declara actualmente una licencia pública en el repositorio. Si el proyecto va a distribuirse públicamente, se recomienda definir una licencia explícita.

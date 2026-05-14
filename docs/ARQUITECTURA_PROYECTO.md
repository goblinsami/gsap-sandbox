# Arquitectura del proyecto (`gsap-sandbox`)

## 1. Objetivo del proyecto

Este proyecto es una app Vue 3 + GSAP para construir y reproducir experiencias tipo "slides" con:

- navegacion por pasos (`step by step`)
- transiciones suaves entre paneles
- soporte de flujo mixto (vertical/horizontal)
- editor visual (`Flow Creator`) para crear/editar/importar/exportar flujos JSON

La idea central es: **un gesto de scroll/touch/teclado = un avance (o retroceso) de un paso**, sin estados intermedios "a medio slide".

---

## 2. Stack tecnologico

- `Vue 3` (SFC + `<script setup>`)
- `TypeScript`
- `Vite`
- `GSAP` (`gsap` + `ScrollTrigger` + `ScrollToPlugin`)
- `marked` + `DOMPurify` para contenido markdown seguro

Scripts principales:

- `npm run dev`
- `npm run build`
- `npm run preview`

---

## 3. Estructura de carpetas

```text
src/
  App.vue
  main.ts
  style.css
  data/
    content.json
    4-per-side-loop.json
    5-vertical.json
    5-horizontal-left.json
    5-horizontal-right.json
    flow-export.json
  types/
    navigation.ts
  utils/
    validateContent.ts
  constants/
    snapEase.ts
  composables/
    useShowcaseFlow.ts
    useSnapNavigation.ts
    useFlowSteps.ts
    useFlowCreator.ts
    useBlockSettings.ts
    useDirectionArrow.ts
  components/
    SectionPanel.vue
    atoms/
      MarkdownEditor.vue
      TextSizePicker.vue
    flow-creator/
      FlowCreator.vue
      FlowBlock.vue
      BlockSettings.vue
```

---

## 4. Modelo de datos

### 4.1 Direcciones sin magic strings

En `src/types/navigation.ts` se define una fuente unica para direcciones:

```ts
export const Direction = {
  Up: 'up',
  Down: 'down',
  Left: 'left',
  Right: 'right'
} as const

export type Direction = (typeof Direction)[keyof typeof Direction]
```

Esto evita hardcodear `'down'`, `'left'`, etc. en la logica de app.

### 4.2 Entidad `Panel`

Cada panel contiene:

- `id`
- textos (`eyebrow`, `title`, `description`)
- flags de render (`useMarkdown`)
- tamanos (`titleSize`, `eyebrowSize`, `descriptionSize`)
- estilo (`panelClass`)
- `image`
- `nextPanelPosition` (direccion hacia el siguiente panel)

### 4.3 Esquema global (`ContentSchema`)

```ts
export interface ContentSchema {
  autoSnapEnabled?: boolean
  loopEnabled?: boolean
  snapEase?: string
  panels: Panel[]
}
```

- `autoSnapEnabled`:
  - `true`: modo controlado por eventos (`wheel/touch/keyboard`)
  - `false`: modo timeline `ScrollTrigger`
- `loopEnabled`:
  - permite wrap circular por indice (`last -> first`, `first -> last`)
- `snapEase`:
  - easing para transiciones snap

---

## 5. Flujo de inicio de la app

### 5.1 Entrada

`src/main.ts`:

1. importa `style.css`
2. monta `App.vue`

### 5.2 Capa de composicion (`App.vue`)

`App.vue` esta simplificado y solo:

- renderiza `FlowCreator`
- renderiza los steps visuales (`flowSteps`)
- conecta refs de escenario (`snapShellRef`, `snapStageRef`)
- delega toda la logica a `useShowcaseFlow()`

### 5.3 Orquestacion (`useShowcaseFlow.ts`)

Responsabilidades:

1. Cargar y validar `src/data/content.json`
2. Construir estado reactivo `panelsState`
3. Resolver `snapEase` con `normalizeSnapEase`
4. Derivar `flowSteps` con `useFlowSteps`
5. Inicializar motor de navegacion con `useSnapNavigation`
6. Exponer handlers para:
   - actualizar paneles
   - cambiar easing desde `FlowCreator`

Si el JSON es invalido, muestra `alert` con errores.

---

## 6. Validacion de contenido (`validateContent.ts`)

Validaciones principales:

- `content` debe ser objeto
- `panels` debe existir y no estar vacio
- tipos correctos de todos los campos
- `id` obligatorio y unico
- `nextPanelPosition` dentro de `Direction`
- `autoSnapEnabled`, `loopEnabled`, `snapEase` con tipos correctos
- regla de flujo anti-opuestos consecutivos:
  - no permite que un panel tenga direccion opuesta al anterior inmediatamente
  - ejemplo: `right` seguido de `left`

> Nota: esta regla evita zig-zag instantaneo en la definicion del flujo.

---

## 7. Construccion del flujo lineal (`useFlowSteps.ts`)

`useFlowSteps` transforma `panels[]` en `flowSteps[]`.

Cada `FlowStep` incluye:

- `index`
- `panel`
- coordenadas virtuales (`x`, `y`)
- `directionToNext`

Algoritmo:

1. inicia en `(0,0)`
2. agrega step actual
3. mueve `(x,y)` segun `nextPanelPosition` con vector:
   - `Up` => `(0,-1)`
   - `Down` => `(0,1)`
   - `Left` => `(-1,0)`
   - `Right` => `(1,0)`

Resultado: una ruta lineal de pasos sobre una malla 2D.

---

## 8. Motor de navegacion (`useSnapNavigation.ts`)

Este composable concentra toda la logica de snap/transicion.

### 8.1 Estado interno

- refs DOM:
  - `snapShellRef`
  - `snapStageRef`
- estado:
  - `activeStepIndex`
  - `isTransitioning`
- variables de control de input:
  - `touchStartY`, `touchCommitted`
  - `lastInputAt` (cooldown)

### 8.2 Geometria de render

- cada step se pinta absoluto en viewport:
  - `transform: translate3d(step.x * 100vw, step.y * 100vh, 0)`
- el `stage` se anima con `x/y` negativos para traer el step activo al viewport

### 8.3 Navegacion por indice

- `normalizeIndex`:
  - si `loopEnabled=false`: clamp normal
  - si `loopEnabled=true`: modulo circular

### 8.4 Modo A: `autoSnapEnabled=true`

Escucha eventos globales:

- `wheel`
- `touchstart` + `touchmove` + `touchend`
- `keydown` (`Arrow`, `PageUp/PageDown`, `Space`)

Comportamiento:

1. detecta direccion del gesto
2. aplica `threshold` y `cooldown`
3. llama `goToStep(active + 1)` o `goToStep(active - 1)`
4. bloquea nuevos cambios mientras `isTransitioning=true`

### 8.5 Modo B: `autoSnapEnabled=false`

Crea un timeline GSAP con labels por step y un `ScrollTrigger`:

- `pin: true`
- `scrub: 1`
- `snap: { snapTo: 'labelsDirectional', ... }`

Este modo mantiene scroll tradicional pero con snap dirigido por labels.

### 8.6 Reinit y limpieza

`initNavigation()`:

- mata triggers previos
- reubica stage al step activo
- reinstala listeners/timeline segun modo

`destroyNavigation()`:

- remove listeners
- kill `ScrollTrigger`
- limpia flags y clases de body

Tambien se reinit en:

- cambio de `flowSteps`
- `resize` (debounced)
- cambio de `snapEase` (en modo timeline)

---

## 9. Easing y opciones (`snapEase.ts`)

`src/constants/snapEase.ts` centraliza:

- `DEFAULT_SNAP_EASE`
- `SNAP_EASE_OPTIONS`
- `normalizeSnapEase`

`FlowCreator` permite elegir easing via `<select>`, que actualiza estado reactivo y afecta transiciones.

---

## 10. Editor visual (`FlowCreator`)

### 10.1 `FlowCreator.vue` (UI de editor)

Incluye:

- boton para abrir modal
- canvas del grafo de flujo
- botones debug/export
- selector de easing
- selector de JSON en `src/data`
- import de JSON local (input file)

### 10.2 Logica de editor (`useFlowCreator.ts`)

Responsabilidades:

- mantener copia local editable de paneles
- calcular posiciones de nodos (`positionedPanels`) siguiendo direcciones
- dibujar enlaces entre nodos (`flowLinks`)
- insertar paneles por handles `up/down/left/right`
- abrir/guardar/borrar panel desde `BlockSettings`
- renumerar IDs y titulos al modificar (`panel-1`, `panel-2`, ...)
- validar estructura antes de `commit`
- exportar JSON
- importar JSON (objeto o archivo)

### 10.3 Insercion y restricciones

`insertableDirections(index)` prueba direcciones candidatas y solo muestra las validas segun:

- regla de oposicion inmediata
- validacion global del esquema

### 10.4 `BlockSettings.vue`

Edita por panel:

- textos
- markdown on/off
- tamanos S/M/L
- clase visual
- imagen (file drop, random, remove)

---

## 11. Render de paneles (`SectionPanel.vue`)

`SectionPanel`:

- renderiza imagen de fondo + overlay
- renderiza texto centrado
- puede interpretar markdown seguro (`marked` + `DOMPurify`)
- opcionalmente muestra icono de direccion con `useDirectionArrow`

---

## 12. Sistema de estilos (`style.css`)

Bloques mas importantes:

- layout del viewport snap:
  - `.snap-shell`
  - `.snap-stage`
  - `.snap-step`
- modo autosnap:
  - `body.snap-mode { overflow: hidden; }`
  - `.snap-shell--auto { touch-action: none; }`
- estilos de paneles (`contrast`, `ocean`, etc.)
- estilos completos del Flow Creator/modal/canvas/settings

---

## 13. Archivos JSON de ejemplo (`src/data`)

- `content.json`: flujo principal por defecto
- `4-per-side-loop.json`: plantilla "cuadrado loop", 4 paneles por lado, `loopEnabled=true`
- `5-vertical.json`: ejemplo vertical
- `5-horizontal-left.json`: ejemplo horizontal izquierda
- `5-horizontal-right.json`: ejemplo horizontal derecha
- `flow-export.json`: ejemplo exportado desde editor

`FlowCreator` los descubre automaticamente via `import.meta.glob('../../data/**/*.json', { eager: true })`.

---

## 14. Logging y debug

Prefijo principal: `[flow-snap]`

Eventos que se loguean:

- `mounted`
- `init`
- `jump`
- `wheel`, `touchstart`, `touchmove`, `touchend`, `keydown`
- `transition:start`, `transition:end`, `transition:interrupt`
- `wrap` (cuando loop normaliza indices)
- `input:cooldown`
- `ease:update`

---

## 15. Flujo de datos resumido (end-to-end)

1. Se carga `content.json`
2. Se valida schema
3. Se crea `panelsState`
4. Se derivan `flowSteps` (coordenadas)
5. Se inicializa `useSnapNavigation`
6. Usuario navega con wheel/touch/teclado
7. `goToStep` anima stage a siguiente/anterior paso
8. Si se edita en `FlowCreator`, se actualiza `panelsState`
9. Cambia `flowSteps` -> reinit de navegacion

---

## 16. Notas de mantenimiento

### 16.1 Limpieza de composables

Los composables no utilizados deben eliminarse para evitar deuda tecnica.
Actualmente la navegacion y el editor usan solo los composables listados en la seccion de estructura.

### 16.2 Restriccion TS relevante

`tsconfig` usa `erasableSyntaxOnly: true`.

Por eso se usa patron `const Direction + type Direction` en vez de `enum` TypeScript clasico.

### 16.3 Encoding

Hay algunos textos heredados con caracteres mojibake (`Ã¡`, etc.) en mensajes legacy.
No rompe logica, pero conviene normalizar encoding UTF-8 en una pasada de higiene.

---

## 17. Como extender

### 17.1 Nuevo tipo de easing

1. agregar valor en `src/constants/snapEase.ts` (`SNAP_EASE_OPTIONS`)
2. opcional: setear `snapEase` en JSON

### 17.2 Nuevo template JSON

1. crear archivo en `src/data/*.json`
2. respetar `ContentSchema`
3. aparecera automaticamente en el selector de `FlowCreator`

### 17.3 Cambiar sensibilidad de input

Modificar en `useSnapNavigation.ts`:

- `WHEEL_INTENT_THRESHOLD`
- `TOUCH_INTENT_THRESHOLD`
- `INPUT_COOLDOWN_MS`
- `SNAP_DURATION`

---

## 18. Comandos utiles

```bash
npm install
npm run dev
npm run build
npm run preview
```

---

## 19. Resumen ejecutivo

La arquitectura actual separa bien:

- composicion UI (`App.vue`)
- orquestacion de estado (`useShowcaseFlow`)
- motor de navegacion (`useSnapNavigation`)
- transformacion de datos a steps (`useFlowSteps`)
- editor visual y operaciones de flujo (`FlowCreator` + `useFlowCreator`)

El resultado es un sistema flexible, editable por JSON y con transiciones consistentes de paso a paso.

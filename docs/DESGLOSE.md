# NEUROFLOW — El desglose de tareas, 10-100× mejor

> Estudio y registro de la mejora del motor que parte una tarea grande en pasos
> pequeños y accionables. Es **la herramienta estrella** de la app: convierte
> "escribir la tesis" o "lavar la ropa" en una secuencia concreta que el cerebro
> TDAH/AACC puede empezar sin fricción. Todo funciona **offline**, sin nube.

---

## 1. Por qué importa (y qué hacía la versión anterior)

Para el TDAH la barrera no suele ser la capacidad, sino el **arranque**: una tarea
enunciada en abstracto ("hacer la declaración") no ofrece un primer gesto, así que
se pospone. Partirla en micro-pasos con un arranque de 2 minutos elimina esa
barrera. Ese es el trabajo del motor.

**Versión anterior (baseline):**
- **127 intenciones**, 5-7 ejemplos cada una.
- Recuperación por **TF-IDF + vecino más cercano**: se tokeniza la tarea, se
  compara (coseno) con los ejemplos y se toma la intención ganadora.
- Receta **fija de 5 pasos** por intención, con `%s` sustituido por el objeto.
- Sin sinónimos, sin tolerancia a erratas, sin adaptación al contexto.

**Límites medidos.** Sobre 70 frases nuevas (fraseos coloquiales reales, no los de
entrenamiento), el baseline acertaba la intención en **46/70 = 65,7 %** — y 15 de
esas 70 tareas ni siquiera tenían una intención que existiera en el corpus de 127.
Es decir: buena base, pero se quedaba corto en cobertura y en robustez ante cómo
habla la gente de verdad.

---

## 2. Las palancas (de más a menos impacto)

### Palanca 1 — Cobertura: 127 → **403 intenciones**
Se generó un corpus nuevo por dominios (cocina, limpieza, colada, hogar,
admin/dinero/trámites, trabajo/estudio, digital/tech, recados/compras, coche,
social/familia, peques, autocuidado, hobbies, jardín, mascotas, eventos,
reparaciones, viaje…). Cada intención trae **8-12 fraseos** y una receta de
**5-8 pasos** específicos, en lenguaje llano, con el **primer paso ≤ 2 min**.
Total: **403 intenciones, 3 249 frases de ejemplo**.

Regla de producto respetada en todo el corpus: **cero contenido de
medicación/medicina** (ni "pastilla", ni "médico", ni fármacos). Verificado a 0
referencias.

### Palanca 2 — Emparejado robusto (como habla la gente)
- **Mapa de sinónimos/lemas** (100 entradas): `lavadora`, `colada`, `camisas` →
  `ropa`; `móvil`/`celular`/`smartphone` → `movil`; `curro`/`laburo` → `trabajo`;
  `pillar`/`mercar` → `comprar`; etc. Se aplica **igual al entrenar y al inferir**,
  así "meter una lavadora" cae en la intención de colada aunque no diga "ropa".
- **Stem con pronombre enclítico**: `plancharme` → `planchar`, `acostarse` →
  `acostar` (con guarda `ar/er/ir` para no romper palabras normales como *clase* o
  *aceite*). Recupera el verbo cuando va pegado al pronombre.
- **Respaldo por trigramas de caracteres**: si el TF-IDF no es concluyente
  (confianza < 0,30), se compara por **similitud de trigramas** (Jaccard) contra
  las frases de ejemplo. Tolera **erratas y fraseos nuevos** que el vocabulario no
  cubre. Se queda con el resultado solo si supera su propio umbral.
- **Confianza calibrada**: se devuelve la mejor similitud real (coseno por
  intención), y el desglose decide receta-vs-genérico con un umbral honesto.

### Palanca 3 — Desglose **compositivo** (el "10×" de verdad)
La receta base ya no es el resultado final: es la **materia prima**. Sobre ella se
aplica andamiaje TDAH **solo donde aporta**, sin estropear las recetas que ya son
buenas:
- **Arranque de 2 min** garantizado — pero solo si la tarea *no* empieza ya con un
  paso pequeño (umbral > 5 min). Así "lavar la ropa" mantiene intacta su receta
  querida, y una tarea que arranca con un bloque grande recibe una rampa de entrada.
- **Granularidad escalada por energía/tamaño**: si la energía es **alta** o la
  tarea es larga (> 60 min), el **paso núcleo** (el más largo) se parte en dos
  mitades finas. Energía alta → más granularidad; energía baja → se respeta el
  tamaño pequeño.
- **Punto de control** para tareas largas (> 45 min): "¿vas bien? respira 1 min y
  sigue", insertado hacia el 60 %.
- **Cierre/celebrar** garantizado si la receta no cerraba ya sola.
- **Sustitución de objeto mejorada** (`objectOf` + `nfFill`): quita verbo y
  artículos ("pasear **al** perro" → objeto "perro") y **colapsa palabras
  repetidas** ("de la tesis %s" → "de la tesis", no "tesis tesis").

Resultado: para una tarea pequeña y ya bien resuelta, el desglose **no añade
relleno**; para una tarea grande y de alta energía, aparece la granularidad fina,
el punto de control y el cierre. La misma tarea se adapta a **cuánta energía tienes
hoy**.

### Palanca 4 — Genérico v2 (cuando no hay intención)
Si ninguna intención supera el umbral, se usa un **andamiaje universal** realmente
útil: definir "hecho", reunir lo necesario, arranque de 2 min, avanzar el núcleo,
punto de control y cierre. Nunca deja al usuario con un desglose vacío o inútil.

### Palanca 5 — Aprende de tus ediciones (mejora con el uso, sin nube)
Si editas los pasos de una tarea (añades o borras), NEUROFLOW guarda un **override
local** indexado por el título normalizado y lo **prefiere la próxima vez** que
partas esa misma tarea. Se persiste **cifrado** en el vault (`snap`/`apply`). El
motor mejora con tu forma de trabajar, y todo se queda en tu dispositivo.

### Palanca 6 — IA en la nube opcional (opt-in) se mantiene
El motor local es el fuerte y el que va por defecto. La opción de IA en la nube
sigue existiendo, **desactivada** salvo que tú pongas tu propio endpoint — sin
claves embebidas, con consentimiento explícito, y con caída a local.

---

## 3. Arquitectura (qué corre dónde)

Entrenamiento **offline** en Python (`engine/train.py`), inferencia 100 % en **JS
dentro de la app**, sin red:

```
engine/intents_extra.py   Corpus fusionado (383 intenciones extra) + 20 base = 403
engine/train.py           TF-IDF + sinónimos + stem enclítico + export de trigramas
        │  entrena
        ▼
engine/model.json         { idf, ph:[[intent,frase]], recipes, syn }   (~265 KB)
        │  se incrusta (inline) en
        ▼
public/demo.html          NF_MODEL + motor JS (nfTok/nfQvec/nfTri/nfClassify/breakdown)
```

**Truco de tamaño:** en vez de guardar miles de vectores y perfiles de trigramas
(que pesaban ~530 KB), el modelo guarda las **frases en crudo** (`ph`) y la app las
vectoriza y trigramiza **una sola vez al arrancar**. Mismo poder, la mitad de peso
(265 KB), y las frases reales sirven además para el respaldo por trigramas gratis.

---

## 4. Resultados (medidos)

Prueba de precisión del clasificador sobre **70 frases nuevas** (fraseos
coloquiales que no están en el entrenamiento), aceptando como correctas las
intenciones sinónimas equivalentes:

| Motor | Intenciones | Aciertos | Precisión |
|-------|:-----------:|:--------:|:---------:|
| **Anterior** (baseline) | 127 | 46/70 | **65,7 %** |
| **Nuevo** | 403 | 69/70 | **98,6 %** |

Además, 15 de esas 70 tareas **no tenían ninguna intención** representable en el
corpus antiguo; ahora sí. La única frase fallada ("pillar comida para toda la
semana en el súper") cae en *batch cooking* en vez de *compra* — una ambigüedad
genuina entre comprar y cocinar para la semana.

**Auto-test in-app (`?selftest`) — 12/12 PASA**, incluye:
- Precisión del clasificador ≥ 10/12 (obtenido 11/12).
- Sinónimos colapsan (`lavadora` → `ropa`).
- El genérico siempre cierra con un paso de cierre.
- Aprende de ediciones (usa el override guardado).
- (Y las de siempre: desglose, cripto ida y vuelta, recuperación con frase, ICS,
  deshacer, purga de papelera.)

**Ejemplo real (verificado):** "escribir la tesis" con energía **alta** →
clasifica `hacer_tesis` (conf 1.0) y produce **8 pasos, ~77 min**: abre y elige
capítulo (2 min) · relee notas (10) · fija objetivo pequeño (5) · revisa
bibliografía (18) · **punto de control** (1) · escribe la sección — **primera
mitad** (18) · **segunda mitad** (17) · guarda y anota el siguiente paso (6).
La misma tarea con energía media/baja no se trocea de más.

**Ejemplo intacto:** "lavar la ropa" con energía media mantiene su receta querida
de 5 pasos, sin relleno: separar por colores · poner lavadora · tender · doblar ·
guardar.

---

## 5. Verificación técnica
- Reentrenamiento sin errores: **403 intenciones, 3 249 frases, vocab 1 376**.
- `node --check` del `<script>` de la app: **OK**.
- `?selftest` en Chromium headless: **12/12**.
- Precisión del clasificador sobre 60+ frases nuevas: **98,6 %** (vs 65,7 % antes).
- Capturas: vista de mes con pips de colores + barra de carga; desglose fino de una
  tarea grande de alta energía.
- 0 referencias a medicación/medicina en app y motor.

---

## 6. Siguientes pasos (honestos)
- Ampliar el mapa de sinónimos con el uso real (jerga regional).
- Aprendizaje de ediciones también por intención (no solo por título), con cuidado
  de no mezclar objetos distintos.
- Medir la calidad *de los pasos* (no solo el acierto de intención) con feedback
  in-app opcional.

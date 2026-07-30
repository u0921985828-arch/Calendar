# Motor de desglose offline (TF-IDF + kNN)

Motor de descomposición de tareas **entrenado y ejecutado sin depender de una IA
externa**. No es un LLM: es recuperación por similitud sobre un corpus curado de
tareas ya desglosadas por "expertos". Reconoce de qué tipo es una tarea aunque se
escriba distinta, coge la receta más parecida y la adapta (inyecta el objeto de
la frase). Corre 100% en el cliente, offline.

## Cómo funciona
1. **Corpus** (`train.py` + `intents_extra.py`): **127 intenciones** (~535 frases
   de ejemplo) que cubren hogar, cocina, admin/dinero, salud, trabajo/estudio,
   social, compras, viajes, coche, digital, hobbies y niños. Cada intención tiene
   frases de ejemplo y una receta de micro-pasos con estimaciones.
2. **Entrenamiento** (`train.py`, Python puro, sin dependencias):
   - Tokeniza (minúsculas, sin acentos, sin stopwords, stemming ligero ES).
   - Calcula IDF sobre el corpus y un vector TF-IDF normalizado por ejemplo.
   - Exporta `model.json` (idf + vectores de ejemplo + recetas).
3. **Inferencia** (en la app, JS): vectoriza la tarea del usuario con el mismo
   tokenizador e IDF, busca los 5 vecinos por coseno, vota la intención y aplica
   su receta. Si la confianza es baja → desglose genérico.

## Reentrenar
```
cd engine
python3 train.py    # regenera model.json
```
Luego reemplaza el `NF_MODEL` incrustado en `public/demo.html` por el nuevo
`model.json` (bloque `var NF_MODEL=…;`).

## Ampliar
Añade intenciones o frases en `intents_extra.py` (dict `EXTRA`) o en `INTENTS`
de `train.py`. Más frases por intención = mejor reconocimiento de variantes. Es
el camino barato para que el motor sea más potente sin servidor. Consultas muy
vagas (sin señal) caen a un desglose genérico a propósito.

## Relación con la IA real
Este motor es el modo **offline / gratis**. Cuando hay servidor + `ANTHROPIC_API_KEY`,
el desglose puede usar Claude (`app/api/breakdown/route.ts`) para tareas
arbitrarias, con este motor como red de seguridad.

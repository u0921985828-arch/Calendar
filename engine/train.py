#!/usr/bin/env python3
# Entrena un motor de desglose por RECUPERACION (TF-IDF + vecino mas cercano).
# Salida: model.json  -> se incrusta en la app y la inferencia corre en JS.
import unicodedata, re, json, math

STOP = set("de la el los las un una unos unas y o u a e en con por para que se su sus mi mis "
           "tu tus al del lo le les me te nos os es son ser estar he ha han hay muy mas este esta "
           "esto ese esa eso como cuando donde sin sobre entre hasta desde ya no si mismo cada "
           "hacer poner tener dar ir cosa cosas algo tengo quiero necesito".split())

def strip_accents(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')

def tokenize(s):
    s = strip_accents(s.lower())
    out = []
    for t in re.split(r'[^a-z0-9]+', s):
        if len(t) < 2 or t in STOP:
            continue
        if len(t) > 5 and t.endswith('es'): t = t[:-2]
        elif len(t) > 4 and t.endswith('s'): t = t[:-1]
        out.append(t)
    return out

# intent: {ex:[frases], steps:[[label, est_min], ...]}   (%s = objeto de la tarea)
INTENTS = {
 "email": {"ex":["contestar correos","responder emails atrasados","vaciar la bandeja de entrada","responder mensajes del trabajo","ponerme al dia con el correo","contestar mails pendientes","responder el correo del jefe"],
   "steps":[["Abrir la bandeja y ordenar por urgencia",3],["Marcar los 3 mas importantes",2],["Responder el mas urgente",8],["Contestar el resto en bloque",12],["Archivar y dejar la bandeja a cero",3]]},
 "informe": {"ex":["escribir el informe","redactar la propuesta","preparar el documento","hacer el informe mensual","terminar la propuesta del cliente","redactar la memoria","escribir el reporte"],
   "steps":[["Abrir el documento y releer el objetivo de: %s",5],["Esbozar el indice en 3-5 puntos",8],["Rellenar cada seccion con bullets",15],["Redactar en prosa a partir de los bullets",20],["Revisar, dar formato y enviar",10]]},
 "llamada": {"ex":["llamar al banco","hacer una llamada importante","llamar para reclamar","devolver la llamada","llamar a mi madre","contactar con el proveedor","llamar por telefono"],
   "steps":[["Anotar en 1 frase el objetivo de: %s",2],["Buscar el numero y un buen momento",3],["Apuntar 3 cosas que quiero decir",4],["Hacer la llamada",10],["Anotar lo acordado y el siguiente paso",3]]},
 "reunion": {"ex":["preparar la reunion","organizar una reunion de equipo","agendar reunion con el cliente","preparar la reunion de manana","reunion semanal","montar una reunion"],
   "steps":[["Definir el objetivo de: %s en 1 frase",3],["Fijar fecha y avisar a los asistentes",5],["Preparar el orden del dia",8],["Reunirse y tomar notas",30],["Enviar el resumen y las tareas",8]]},
 "limpieza": {"ex":["limpiar la casa","limpiar la cocina","ordenar el salon","limpiar el bano","hacer limpieza general","recoger el cuarto","limpiar a fondo","fregar el suelo"],
   "steps":[["Reunir productos y bolsas para: %s",3],["Recoger y tirar lo que sobra",10],["Limpiar superficies de arriba a abajo",15],["Fregar o aspirar el suelo",10],["Sacar la basura y ventilar",4]]},
 "colada": {"ex":["lavar la ropa","poner una lavadora","hacer la colada","lavar y tender","doblar la ropa","lavar la ropa sucia"],
   "steps":[["Separar la ropa por colores",5],["Poner la lavadora",3],["Tender o meter en la secadora",8],["Doblar cuando este seca",10],["Guardar en el armario",5]]},
 "compra": {"ex":["hacer la compra","ir al supermercado","comprar comida para la semana","comprar cosas de casa","hacer la lista de la compra","ir a comprar"],
   "steps":[["Mirar que falta y anotar la lista: %s",6],["Revisar despensa y nevera",4],["Elegir tienda o app y horario",3],["Hacer la compra",30],["Guardar y tachar de la lista",8]]},
 "cocinar": {"ex":["cocinar la cena","preparar la comida","hacer una receta","cocinar para la semana","preparar el almuerzo","hacer batch cooking","hacer la comida"],
   "steps":[["Elegir el plato y ver ingredientes: %s",5],["Sacar y preparar los ingredientes",8],["Cocinar siguiendo los pasos",25],["Emplatar o guardar en tuppers",8],["Recoger la cocina",7]]},
 "pago": {"ex":["pagar la factura","pagar el recibo de la luz","hacer una transferencia","pagar el alquiler","pagar los impuestos","abonar la cuota","pagar la multa"],
   "steps":[["Reunir el importe y los datos de: %s",3],["Abrir la app del banco y ver saldo",2],["Introducir los datos del pago",4],["Confirmar y guardar el comprobante",2],["Anotarlo en los gastos",2]]},
 "tramite": {"ex":["renovar el dni","hacer un tramite","pedir cita previa","gestionar el papeleo","renovar el pasaporte","tramitar la ayuda","sacar cita en el ayuntamiento","hacer una gestion"],
   "steps":[["Buscar que documentos pide: %s",8],["Reunir y preparar los papeles",15],["Pedir cita previa o entrar en la web",8],["Rellenar el formulario",15],["Presentar y guardar el justificante",8]]},
 "estudio": {"ex":["estudiar para el examen","repasar los apuntes","preparar el examen de mates","estudiar el tema 3","empollar para la prueba","estudiar la asignatura"],
   "steps":[["Abrir el material y fijar la meta de hoy: %s",4],["Ojear el indice y priorizar temas",5],["Estudiar un bloque de 25 min",25],["Resumir lo clave en 3 frases",8],["Autoexaminarse y marcar dudas",10]]},
 "escritura": {"ex":["escribir el articulo","redactar un post","escribir el ensayo","escribir en el blog","escribir el guion","redactar el texto","escribir la carta"],
   "steps":[["Definir en 1 frase de que trata: %s",3],["Volcar todas las ideas en bruto",10],["Ordenarlas en intro, cuerpo y cierre",8],["Escribir el borrador de un tiron",25],["Revisar, cortar y pulir",12]]},
 "codigo": {"ex":["arreglar el bug","programar la funcion","implementar la feature","corregir el error","montar la api","hacer el desarrollo","escribir el codigo"],
   "steps":[["Reproducir o entender bien: %s",8],["Localizar el archivo o la causa",10],["Escribir el cambio minimo",20],["Probar con test o a mano",10],["Commit, push y revisar",5]]},
 "ejercicio": {"ex":["ir al gimnasio","salir a correr","entrenar en casa","hacer ejercicio","hacer yoga","dar un paseo largo","entrenar"],
   "steps":[["Preparar ropa y espacio para: %s",4],["Calentar 5 minutos",5],["Hacer el bloque principal",25],["Estirar y enfriar",8],["Anotar como ha ido",2]]},
 "salud_cita": {"ex":["pedir cita con el medico","sacar cita en el dentista","reservar cita medica","pedir cita en el especialista","cita con el fisio","pedir hora en el medico"],
   "steps":[["Buscar el telefono o la app de: %s",4],["Mirar mis huecos disponibles",3],["Pedir la cita",6],["Apuntarla en el calendario",2],["Preparar lo que necesito llevar",5]]},
 "mudanza": {"ex":["preparar la mudanza","empaquetar para mudarme","organizar la mudanza","hacer las cajas","mudarme de piso","recoger para la mudanza"],
   "steps":[["Conseguir cajas y material para: %s",15],["Empezar por una habitacion y etiquetar cajas",40],["Deshacerme de lo que no quiero",30],["Organizar transporte o furgoneta",20],["Actualizar la direccion en lo importante",15]]},
 "viaje": {"ex":["preparar el viaje","hacer la maleta","organizar las vacaciones","planear el viaje","reservar vuelo y hotel","preparar las vacaciones"],
   "steps":[["Fijar fechas y presupuesto de: %s",10],["Reservar transporte y alojamiento",25],["Hacer la lista de que llevar",10],["Preparar la maleta",30],["Revisar documentos y hacer el check-in",10]]},
 "evento": {"ex":["organizar una fiesta","preparar el cumpleanos","montar una cena con amigos","organizar el evento","planear la celebracion","organizar una quedada"],
   "steps":[["Fijar fecha, sitio e invitados de: %s",10],["Enviar las invitaciones",10],["Planear comida y bebida",15],["Comprar y preparar",40],["Montar el dia del evento",30]]},
 "presentacion": {"ex":["preparar la presentacion","hacer las diapositivas","preparar la charla","montar el powerpoint","preparar la exposicion","preparar slides"],
   "steps":[["Definir el mensaje central de: %s",8],["Esquematizar en 5-7 diapositivas",15],["Crear las diapositivas",30],["Ensayar en voz alta",20],["Ajustar tiempos y pulir",10]]},
 "regalo": {"ex":["comprar un regalo","buscar un regalo de cumpleanos","pensar que regalar","comprar el regalo para mi pareja","buscar un detalle"],
   "steps":[["Pensar en gustos y presupuesto: %s",6],["Buscar 3 opciones",10],["Elegir y comprar",15],["Envolver o preparar",8],["Preparar la felicitacion",5]]},
}

try:
    from intents_extra import EXTRA
    INTENTS.update(EXTRA)
except ImportError:
    pass

docs = []  # (intent, tokens)
for intent, d in INTENTS.items():
    for ex in d["ex"]:
        docs.append((intent, tokenize(ex)))

df = {}
for _, toks in docs:
    for t in set(toks):
        df[t] = df.get(t, 0) + 1
N = len(docs)
idf = {t: round(math.log((N + 1) / (c + 1)) + 1, 5) for t, c in df.items()}

def vec(toks):
    tf = {}
    for t in toks:
        if t in idf:
            tf[t] = tf.get(t, 0) + 1
    v = {t: tf[t] * idf[t] for t in tf}
    norm = math.sqrt(sum(x * x for x in v.values())) or 1.0
    return {t: round(x / norm, 5) for t, x in v.items()}

ex_vecs = [[intent, vec(toks)] for intent, toks in docs]
recipes = {intent: {"steps": d["steps"]} for intent, d in INTENTS.items()}

model = {"idf": idf, "ex": ex_vecs, "recipes": recipes}
json.dump(model, open("model.json", "w"), ensure_ascii=False, separators=(",", ":"))
print("intents:", len(INTENTS), "docs:", N, "vocab:", len(idf))
print("model.json bytes:", len(open("model.json", "rb").read()))

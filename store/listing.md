# Textos para la Chrome Web Store

Copiar y pegar en el panel de desarrollador (https://chrome.google.com/webstore/devconsole).

## Pestaña "Ficha de Play Store" / "Store listing"

**Nombre** (sale del manifest): Cumpleaños para Google Calendar

**Descripción breve** (sale del manifest, máx. 132 caracteres):
Agregá cumpleaños a Google Calendar como eventos anuales con recordatorios, en dos clics.

**Descripción:**

```
Que no se te pase ningún cumpleaños.

Cargás el nombre y la fecha, y la extensión crea en tu Google Calendar un evento de día completo que se repite todos los años, con los recordatorios que elijas:

• El mismo día
• Un día antes (9:00)
• Una semana antes (9:00)
• Opcional: un email el día anterior

Como los avisos son de Google Calendar, te llegan al celular, a la compu y por mail aunque Chrome esté cerrado.

También:
• Lista los próximos cumpleaños y cuántos cumple cada persona (si cargaste el año).
• Botón 🎂 dentro de Google Calendar para agregar cumpleaños sin salir de la página.
• Los eventos se marcan como "disponible", así no te bloquean la agenda.
• Si alguien cumple el 29 de febrero, en los años no bisiestos el aviso cae el 28.

Privacidad: la extensión no tiene servidor propio. Solo se comunica con la API de Google Calendar y únicamente toca los eventos de cumpleaños que ella misma crea. Sin publicidad ni rastreo.

Código abierto: https://github.com/smalirat/birthdays-alarms
```

**Categoría:** Productividad → Flujo de trabajo y planificación (Workflow & Planning)
**Idioma:** Español

**Imágenes** (carpeta `store/`):
- Ícono de la tienda 128×128: `icons/icon128.png`
- Captura 1280×800: `store/screenshot-1280x800.png`
- Mosaico promocional pequeño 440×280: `store/promo-440x280.png`

**Sitio web oficial / página de inicio:** https://smalirat.github.io/birthdays-alarms/
**URL de asistencia:** https://github.com/smalirat/birthdays-alarms/issues

## Pestaña "Privacidad" (Privacy practices)

**Propósito único:**

```
Crear en el Google Calendar del usuario eventos anuales de cumpleaños con recordatorios, y listar o borrar esos mismos eventos.
```

**Justificación de permisos:**

| Permiso | Justificación (pegar) |
|---|---|
| `identity` | Se usa para obtener, mediante OAuth 2.0 (chrome.identity.getAuthToken), el permiso del usuario para crear, listar y borrar eventos de cumpleaños en su Google Calendar. |
| `storage` | Guarda localmente qué recordatorios dejó marcados el usuario (el mismo día, un día antes, etc.) para recordarlos la próxima vez que abre el formulario. |
| Permiso de host `https://www.googleapis.com/*` | Es el dominio de la API de Google Calendar. La extensión lo llama para crear, listar y borrar los eventos de cumpleaños. |
| Content script en `https://calendar.google.com/*` | Agrega un botón flotante dentro de Google Calendar que abre el mismo formulario del popup. No lee ni modifica el contenido de la página. |

**¿Usás código remoto?** No. Todo el JavaScript está incluido en el paquete.

**Uso de datos — marcar:**
- [x] Información de identificación personal → *No.* (No se recopila; solo nombres de cumpleaños que el usuario guarda en su propio calendario.)
- Si el formulario pide marcar categorías, la más cercana es **"Contenido del sitio web / información personal"**: los nombres y fechas que carga el usuario, que se envían únicamente a su Google Calendar.

**Certificaciones (marcar las tres):**
- [x] No vendo ni transfiero datos de usuarios a terceros, fuera de los casos de uso aprobados.
- [x] No uso ni transfiero datos de usuarios para fines no relacionados con el propósito único del elemento.
- [x] No uso ni transfiero datos de usuarios para determinar la solvencia o para préstamos.

**URL de la política de privacidad:** https://smalirat.github.io/birthdays-alarms/privacy.html

## Google Cloud → pantalla de consentimiento de OAuth (producción)

- Nombre de la app: Cumpleaños para Google Calendar
- Página principal: https://smalirat.github.io/birthdays-alarms/
- Política de privacidad: https://smalirat.github.io/birthdays-alarms/privacy.html
- Logo: `icons/icon128.png`
- Permiso: `.../auth/calendar.events`
- Justificación del permiso (si pedís verificación):

```
The extension creates yearly all-day birthday events with reminders in the user's primary calendar, lists the birthday events it created, and lets the user delete them. calendar.events is the narrowest scope that allows creating and deleting events; the extension never reads or modifies any other events.
```

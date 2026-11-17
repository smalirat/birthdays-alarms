# Cumpleaños → Google Calendar

Extensión de Chrome: cargás nombre + fecha y se crea en tu Google Calendar un evento
**de día completo, repetido todos los años**, con los recordatorios que elijas:

- El mismo día (00:00)
- Un día antes (9:00)
- Una semana antes (9:00)
- Opcional: email el día anterior

Como los avisos son de Google Calendar, te llegan al celular, a la PC y por mail aunque Chrome esté cerrado.
El popup además lista los próximos cumpleaños (con la edad si cargaste el año) y permite borrarlos.
Si alguien cumple el 29/02, en los años que no son bisiestos el evento cae el 28/02.

## Instalación (una sola vez, ~5 minutos)

Google exige un "Client ID" propio para que la extensión pueda escribir en tu calendario.

1. **Cargar la extensión**
   - Abrí `chrome://extensions`, activá **Modo de desarrollador**.
   - **Cargar extensión sin empaquetar** → elegí esta carpeta.
   - Copiá el **ID** de la extensión (algo como `abcdefghijk...`).

2. **Crear el Client ID en Google Cloud**
   - Entrá a https://console.cloud.google.com y creá un proyecto (ej: "Cumpleaños").
   - *APIs y servicios → Biblioteca* → buscá **Google Calendar API** → **Habilitar**.
   - *APIs y servicios → Pantalla de consentimiento de OAuth* (o "Google Auth Platform"):
     tipo **Externo**, completá nombre y tu mail, y en **Usuarios de prueba** agregá tu cuenta de Gmail.
   - *Credenciales → Crear credenciales → ID de cliente de OAuth* →
     tipo de aplicación **Extensión de Chrome** → pegá el ID del paso 1.
   - Copiá el **Client ID** que te da (termina en `.apps.googleusercontent.com`).

3. **Configurarlo**
   - En [manifest.json](manifest.json) reemplazá `PEGAR_TU_CLIENT_ID.apps.googleusercontent.com` por tu Client ID.
   - En `chrome://extensions` tocá el botón de recargar de la extensión.

4. Abrí el popup → **Conectar con Google** → aceptá los permisos (va a decir "app no verificada":
   es normal porque la app es tuya; tocá *Continuar*).

> El ID de una extensión sin empaquetar depende de la carpeta. Si movés la carpeta, cambia el ID
> y tenés que actualizarlo en el Client ID de Google Cloud.

## Notas

- Funciona en Google Chrome (usa `chrome.identity`; en Brave/Edge no anda el login).
- Los eventos se crean en tu calendario principal, marcados como "disponible" (no te bloquean la agenda).
- El permiso pedido es solo `calendar.events` (crear/borrar eventos), no acceso a toda tu cuenta.

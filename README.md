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

## Notas

- Funciona en Google Chrome (usa `chrome.identity`; en Brave/Edge no anda el login).
- Los eventos se crean en tu calendario principal, marcados como "disponible" (no te bloquean la agenda).
- El permiso pedido es solo `calendar.events` (crear/borrar eventos), no acceso a toda tu cuenta.

const API = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
const TAG = 'birthdayAlarm'; // propiedad privada para reconocer nuestros eventos

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio',
  'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

// En eventos de día completo, los minutos se cuentan hacia atrás desde las 00:00 del día.
const REMINDERS = [
  { id: 'r-day', label: 'El mismo día (00:00)', minutes: 0, checked: true },
  { id: 'r-1d', label: 'Un día antes (9:00)', minutes: 900, checked: true },      // 24h - 9h
  { id: 'r-1w', label: 'Una semana antes (9:00)', minutes: 9540, checked: false }, // 7d - 9h
];
const EMAIL_MINUTES = 900;

const $ = (id) => document.getElementById(id);

// ---------- Auth + API ----------

function getToken(interactive) {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive }, (result) => {
      const token = typeof result === 'string' ? result : result?.token;
      if (chrome.runtime.lastError || !token) {
        reject(new Error(chrome.runtime.lastError?.message || 'No se pudo iniciar sesión'));
      } else {
        resolve(token);
      }
    });
  });
}

async function api(path, { method = 'GET', body, query, interactive = true } = {}, retry = true) {
  const token = await getToken(interactive);
  const url = new URL(API + path);
  for (const [k, v] of Object.entries(query || {})) url.searchParams.set(k, v);

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && retry) {
    await new Promise((r) => chrome.identity.removeCachedAuthToken({ token }, r));
    return api(path, { method, body, query, interactive }, false);
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Error ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

// ---------- Fechas ----------

const pad = (n) => String(n).padStart(2, '0');
const isLeap = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function birthdayIn(year, month, day) {
  // 29/02 en año no bisiesto → 28/02
  if (month === 2 && day === 29 && !isLeap(year)) return new Date(year, 1, 28);
  return new Date(year, month - 1, day);
}

function nextOccurrence(month, day) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let next = birthdayIn(today.getFullYear(), month, day);
  if (next < today) next = birthdayIn(today.getFullYear() + 1, month, day);
  const days = Math.round((next - today) / 86400000);
  return { next, days };
}

function daysInMonth(month) {
  return new Date(2024, month, 0).getDate(); // 2024 es bisiesto → febrero admite 29
}

// ---------- Crear / listar / borrar ----------

async function createBirthday({ name, day, month, year, reminders, email }) {
  const thisYear = new Date().getFullYear();
  const start = birthdayIn(thisYear, month, day);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const rrule = month === 2 && day === 29
    ? 'RRULE:FREQ=YEARLY;BYMONTH=2;BYMONTHDAY=-1' // último día de febrero
    : 'RRULE:FREQ=YEARLY';

  const overrides = reminders.map((minutes) => ({ method: 'popup', minutes }));
  if (email) overrides.push({ method: 'email', minutes: EMAIL_MINUTES });

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const description = [
    `Cumpleaños de ${name}.`,
    year ? `Nació el ${day}/${month}/${year}.` : null,
    'Creado con la extensión "Cumpleaños para Google Calendar".',
  ].filter(Boolean).join('\n');

  return api('', {
    method: 'POST',
    body: {
      summary: `🎂 Cumpleaños de ${name}`,
      description,
      start: { date: fmt(start), timeZone },
      end: { date: fmt(end), timeZone },
      recurrence: [rrule],
      transparency: 'transparent', // no te marca como "ocupado"
      reminders: { useDefault: false, overrides },
      extendedProperties: {
        private: {
          [TAG]: '1',
          name,
          day: String(day),
          month: String(month),
          year: year ? String(year) : '',
        },
      },
    },
  });
}

async function loadList(interactive = false) {
  const list = $('list');
  try {
    const data = await api('', {
      query: { privateExtendedProperty: `${TAG}=1`, maxResults: '250' },
      interactive,
    });
    $('connect').hidden = true;
    renderList(data.items || []);
  } catch (e) {
    list.innerHTML = '';
    if (!interactive) {
      $('connect').hidden = false; // todavía no hay sesión
    } else {
      setStatus(e.message, 'error');
    }
  }
}

function renderList(items) {
  const list = $('list');
  list.innerHTML = '';

  const rows = items
    .filter((ev) => ev.status !== 'cancelled')
    .map((ev) => {
      const p = ev.extendedProperties?.private || {};
      const month = Number(p.month);
      const day = Number(p.day);
      const { next, days } = nextOccurrence(month, day);
      const age = p.year ? next.getFullYear() - Number(p.year) : null;
      return { id: ev.id, name: p.name || ev.summary, day, month, days, age };
    })
    .sort((a, b) => a.days - b.days);

  if (!rows.length) {
    list.innerHTML = '<li class="empty">Todavía no cargaste ningún cumpleaños.</li>';
    return;
  }

  for (const r of rows) {
    const li = document.createElement('li');
    const when = r.days === 0 ? '¡Hoy! 🎉' : r.days === 1 ? 'Mañana' : `En ${r.days} días`;
    const ageText = r.age ? ` · cumple ${r.age}` : '';

    const info = document.createElement('div');
    info.className = 'info';
    const who = document.createElement('div');
    who.className = 'who';
    who.textContent = r.name;
    const sub = document.createElement('div');
    sub.className = 'when';
    sub.textContent = `${r.day} de ${MONTHS[r.month - 1].toLowerCase()} · ${when}${ageText}`;
    info.append(who, sub);

    const del = document.createElement('button');
    del.className = 'del';
    del.title = 'Borrar del calendario';
    del.textContent = '✕';
    del.addEventListener('click', async () => {
      // Primer clic: pide confirmación. Segundo clic: borra.
      if (!del.dataset.armed) {
        del.dataset.armed = '1';
        del.textContent = '¿Borrar?';
        setTimeout(() => { delete del.dataset.armed; del.textContent = '✕'; }, 3000);
        return;
      }
      del.disabled = true;
      try {
        await api(`/${encodeURIComponent(r.id)}`, { method: 'DELETE' });
        setStatus(`Borrado: ${r.name}`, 'ok');
        loadList(true);
      } catch (e) {
        del.disabled = false;
        setStatus(e.message, 'error');
      }
    });

    li.append(info, del);
    list.append(li);
  }
}

// ---------- UI ----------

function setStatus(msg, kind = '') {
  const el = $('status');
  el.textContent = msg;
  el.className = kind;
}

function initForm() {
  $('month').innerHTML = MONTHS.map((m, i) => `<option value="${i + 1}">${m}</option>`).join('');
  $('month').value = String(new Date().getMonth() + 1);

  $('reminders').innerHTML = REMINDERS.map((r) =>
    `<label class="check"><input type="checkbox" id="${r.id}" ${r.checked ? 'checked' : ''}> ${r.label}</label>`
  ).join('');

  // Recordar la última elección de avisos
  chrome.storage.sync.get(['reminderPrefs', 'emailPref'], ({ reminderPrefs, emailPref }) => {
    if (reminderPrefs) for (const r of REMINDERS) $(r.id).checked = !!reminderPrefs[r.id];
    if (emailPref != null) $('email').checked = emailPref;
  });

  $('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = $('name').value.trim();
    const day = Number($('day').value);
    const month = Number($('month').value);
    const year = $('year').value ? Number($('year').value) : null;

    if (!name) return setStatus('Falta el nombre.', 'error');
    if (!day || day < 1 || day > daysInMonth(month)) {
      return setStatus(`${MONTHS[month - 1]} no tiene día ${day || '?'}.`, 'error');
    }
    if (year && (year > new Date().getFullYear() || (month === 2 && day === 29 && !isLeap(year)))) {
      return setStatus('El año no es válido para esa fecha.', 'error');
    }

    const prefs = Object.fromEntries(REMINDERS.map((r) => [r.id, $(r.id).checked]));
    const reminders = REMINDERS.filter((r) => prefs[r.id]).map((r) => r.minutes);
    const email = $('email').checked;
    chrome.storage.sync.set({ reminderPrefs: prefs, emailPref: email });

    $('submit').disabled = true;
    setStatus('Guardando…');
    try {
      await createBirthday({ name, day, month, year, reminders, email });
      setStatus(`Listo: cumpleaños de ${name} agregado ✔`, 'ok');
      $('name').value = '';
      $('day').value = '';
      $('year').value = '';
      $('name').focus();
      loadList(true);
    } catch (err) {
      setStatus(err.message, 'error');
    } finally {
      $('submit').disabled = false;
    }
  });

  $('connect').addEventListener('click', () => loadList(true));
}

initForm();
loadList(false);
$('name').focus();

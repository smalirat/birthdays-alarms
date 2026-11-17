// Agrega un botón 🎂 flotante en Google Calendar que abre el formulario de la extensión.
(() => {
  if (document.getElementById('bday-ext-root')) return;

  const host = document.createElement('div');
  host.id = 'bday-ext-root';
  const shadow = host.attachShadow({ mode: 'closed' });

  shadow.innerHTML = `
    <style>
      .fab {
        position: fixed; right: 80px; bottom: 24px; z-index: 2147483646;
        width: 52px; height: 52px; padding: 0; border: 0; border-radius: 50%;
        background: #fff; cursor: pointer;
        box-shadow: 0 1px 3px rgba(0,0,0,.3), 0 4px 8px 3px rgba(0,0,0,.15);
        display: grid; place-items: center;
        transition: transform .15s ease;
      }
      .fab:hover { transform: scale(1.06); }
      .fab img { width: 30px; height: 30px; border-radius: 7px; }
      .panel {
        position: fixed; right: 80px; bottom: 88px; z-index: 2147483647;
        width: 340px; height: 600px; max-height: calc(100vh - 110px);
        border: 0; border-radius: 12px; background: #fff;
        box-shadow: 0 4px 24px rgba(0,0,0,.25);
        display: none;
      }
      .panel.open { display: block; }
    </style>
    <button class="fab" title="Agregar cumpleaños" aria-label="Agregar cumpleaños">
      <img src="${chrome.runtime.getURL('icons/icon48.png')}" alt="">
    </button>
    <iframe class="panel" title="Cumpleaños"></iframe>
  `;

  const fab = shadow.querySelector('.fab');
  const panel = shadow.querySelector('.panel');

  function toggle(open = !panel.classList.contains('open')) {
    if (open && !panel.src) panel.src = chrome.runtime.getURL('popup.html');
    panel.classList.toggle('open', open);
  }

  fab.addEventListener('click', (e) => { e.stopPropagation(); toggle(); });
  document.addEventListener('click', (e) => {
    if (!host.contains(e.target)) toggle(false);
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') toggle(false); });

  document.documentElement.appendChild(host);
})();

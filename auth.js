(() => {
  'use strict';
  const KEY = 'ratel.tarimakademisi.demo.v1';
  const SIGNATURE = 'f09be9fb34a32be829c10af3ee3142aa1eff0d70985bf5fbc9a4916d94bdf384';
  const MAX_AGE = 2 * 60 * 60 * 1000;
  const loginPage = /\/login\.html$/.test(location.pathname);
  function validSession() {
    try { const s = JSON.parse(sessionStorage.getItem(KEY) || 'null'); return !!s && s.version === 1 && Number.isFinite(s.expires) && s.expires > Date.now() && s.expires <= Date.now() + MAX_AGE; }
    catch { return false; }
  }
  function leave() { sessionStorage.removeItem(KEY); location.replace(new URL('login.html', location.href).href); }
  async function digest(value) { return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))), b => b.toString(16).padStart(2, '0')).join(''); }
  if (loginPage && validSession()) { location.replace(new URL('./', location.href).href); return; }
  if (!loginPage && !validSession()) { location.replace(new URL('login.html', location.href).href); return; }
  document.documentElement.classList.remove('auth-pending');
  if (loginPage) {
    document.addEventListener('DOMContentLoaded', () => {
      const form = document.getElementById('login-form');
      const error = document.getElementById('login-error');
      const user = document.getElementById('login-user');
      const password = document.getElementById('login-password');
      const submit = form.querySelector('button[type="submit"]');
      form.addEventListener('submit', async event => {
        event.preventDefault(); error.textContent = ''; submit.disabled = true;
        user.removeAttribute('aria-invalid'); password.removeAttribute('aria-invalid');
        try {
          const signature = await digest(user.value.trim().normalize('NFC').toLocaleLowerCase('tr-TR') + ':' + password.value);
          if (signature !== SIGNATURE) {
            error.textContent = 'Kullanıcı adı veya şifre hatalı. Lütfen tekrar deneyin.';
            user.setAttribute('aria-invalid', 'true'); password.setAttribute('aria-invalid', 'true');
            password.value = ''; password.focus(); return;
          }
          sessionStorage.setItem(KEY, JSON.stringify({version: 1, expires: Date.now() + MAX_AGE}));
          location.replace(new URL('./', location.href).href);
        } catch {
          error.textContent = 'Giriş tamamlanamadı. Tarayıcınızda oturum verilerine izin verip tekrar deneyin.';
        } finally { submit.disabled = false; }
      });
    });
  } else {
    window.addEventListener('pageshow', () => { if (!validSession()) leave(); });
    window.addEventListener('academy-demo-logout', leave);
    document.addEventListener('visibilitychange', () => { if (!document.hidden && !validSession()) leave(); });
    const control = document.createElement('button');
    control.type = 'button'; control.textContent = 'Demodan çık'; control.className = 'ratel-demo-exit';
    control.setAttribute('aria-label', 'Demo oturumunu kapat'); control.addEventListener('click', leave);
    document.addEventListener('DOMContentLoaded', () => document.body.appendChild(control));
  }
})();

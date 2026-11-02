// Cookie and analytics consent. Essential storage (cart, theme, this choice)
// always works. Optional scripts load only after "Accept".
(function () {
  var KEY = 'ms-consent';
  var VERSION = 1;
  // Paste the Cloudflare Web Analytics token here to switch analytics on.
  var CF_ANALYTICS_TOKEN = '';

  function read() {
    try {
      var c = JSON.parse(localStorage.getItem(KEY) || 'null');
      return c && c.v === VERSION ? c : null;
    } catch (e) { return null; }
  }
  function write(analytics) {
    var c = { v: VERSION, analytics: !!analytics, at: new Date().toISOString() };
    try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {}
    return c;
  }
  function loadOptional(c) {
    if (!c || !c.analytics || !CF_ANALYTICS_TOKEN || document.getElementById('cf-beacon')) return;
    var s = document.createElement('script');
    s.id = 'cf-beacon';
    s.defer = true;
    s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    s.setAttribute('data-cf-beacon', JSON.stringify({ token: CF_ANALYTICS_TOKEN }));
    document.head.appendChild(s);
  }

  function init() {
    var bar = document.getElementById('consent');
    var current = read();
    loadOptional(current);
    if (!bar) return;
    var show = function () { bar.hidden = false; requestAnimationFrame(function () { bar.classList.add('show'); }); };
    var hide = function () { bar.classList.remove('show'); setTimeout(function () { bar.hidden = true; }, 500); };
    if (!current) setTimeout(show, 1200);
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('[data-consent]');
      if (!b) return;
      var c = write(b.getAttribute('data-consent') === 'all');
      loadOptional(c);
      hide();
    });
    var again = document.getElementById('cookieSettings');
    if (again) again.addEventListener('click', show);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

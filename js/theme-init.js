// Runs before paint so a saved dark theme does not flash light first.
try {
  var t = localStorage.getItem('ms-theme');
  if (t === 'dark' || t === 'light') document.documentElement.dataset.theme = t;
} catch (e) {}

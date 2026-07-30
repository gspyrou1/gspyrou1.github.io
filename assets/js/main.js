// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// ── Active nav link ────────────────────────────────────────
// Targets are derived from the nav itself, so the two can never drift apart.
const navLinks = [...document.querySelectorAll('.nav-links a')];
const targets  = navLinks
  .map(link => ({ link, section: document.querySelector(link.getAttribute('href')) }))
  .filter(t => t.section);

const NAV_H = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 52;

function setActive() {
  const probe    = window.scrollY + NAV_H + 24;
  const atBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 2;

  let current = atBottom ? targets[targets.length - 1] : null;

  if (!current) {
    for (const t of targets) {
      if (t.section.offsetTop <= probe) current = t;
    }
  }

  navLinks.forEach(a => a.classList.remove('active'));
  if (current) current.link.classList.add('active');
}

let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { setActive(); ticking = false; });
}

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll, { passive: true });
setActive();

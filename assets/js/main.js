// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// ── Scroll reveal ──────────────────────────────────────────
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── Active nav link on scroll ──────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const navObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a => a.classList.remove('active'));
      const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => navObserver.observe(s));

// ── GitHub projects ────────────────────────────────────────
const langColours = {
  Python:             '#3572A5',
  JavaScript:         '#f1e05a',
  TypeScript:         '#2b7489',
  'Jupyter Notebook': '#DA5B0B',
  Jupyter:            '#DA5B0B',
  C:                  '#555555',
  'C++':              '#f34b7d',
  Java:               '#b07219',
  Go:                 '#00ADD8',
  Rust:               '#dea584',
  HTML:               '#e34c26',
  CSS:                '#563d7c',
  Shell:              '#89e051',
  R:                  '#198CE7',
};

// Hardcoded featured projects — always shown first, API results follow
const PINNED = [
  {
    name:        'file-sync-system',
    description: 'Linux file sync daemon in C — inotify watches, forked workers, named-pipe CLI, and a Bash status script.',
    language:    'C',
    html_url:    'https://github.com/smurrffy/file-sync-system',
  },
];

const PINNED_NAMES = new Set(PINNED.map(p => p.name));
const EXCLUDED     = new Set(['smurrffy', 'smurrffy.github.io']);

function buildCard(repo, delay, featured = false) {
  const colour = repo.language ? (langColours[repo.language] ?? '#7a7890') : null;
  const desc   = repo.description ? escapeHtml(repo.description) : 'No description provided.';
  const stars  = repo.stargazers_count ?? 0;
  const forks  = repo.forks_count ?? 0;

  return `
    <a class="project-card${featured ? ' project-card--featured' : ''} reveal" data-delay="${delay}"
       href="${escapeHtml(repo.html_url)}" target="_blank" rel="noopener">
      <div class="project-card-header">
        <i class="fas fa-book"></i>
        <span class="project-name">${escapeHtml(repo.name)}</span>
        ${featured ? '<span class="project-badge">Featured</span>' : ''}
      </div>
      <p class="project-desc">${desc}</p>
      <div class="project-meta">
        ${colour ? `<span><span class="lang-dot" style="background:${colour}"></span>${escapeHtml(repo.language)}</span>` : ''}
        ${stars > 0 ? `<span><i class="fas fa-star" style="color:#c4a24a"></i> ${stars}</span>` : ''}
        ${forks > 0 ? `<span><i class="fas fa-code-fork"></i> ${forks}</span>` : ''}
      </div>
    </a>`;
}

async function loadProjects() {
  const grid = document.getElementById('projects-grid');

  // Render pinned cards immediately — no API wait
  grid.innerHTML = PINNED.map((repo, i) => buildCard(repo, i + 1, true)).join('');
  grid.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  try {
    const res = await fetch('https://api.github.com/users/smurrffy/repos?sort=updated&per_page=30');
    if (!res.ok) throw new Error('GitHub API error');
    const repos = await res.json();

    const filtered = repos
      .filter(r => !r.fork && !EXCLUDED.has(r.name) && !PINNED_NAMES.has(r.name))
      .sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 7); // 7 + 1 pinned = 8 total

    if (filtered.length > 0) {
      const startDelay = PINNED.length + 1;
      const html = filtered.map((repo, i) => buildCard(repo, ((startDelay + i) % 4) + 1)).join('');
      grid.insertAdjacentHTML('beforeend', html);
      grid.querySelectorAll('.reveal:not(.visible)').forEach(el => revealObserver.observe(el));
    }

  } catch {
    // Pinned cards already visible — just append a quiet fallback note
    grid.insertAdjacentHTML('beforeend', `
      <p class="error-state" style="grid-column:1/-1;padding:16px 0 0;font-size:0.8rem;">
        Could not load other repositories.
        <a href="https://github.com/smurrffy" target="_blank" rel="noopener">View all on GitHub →</a>
      </p>`);
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

loadProjects();

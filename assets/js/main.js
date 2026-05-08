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

const EXCLUDED = new Set(['smurrffy', 'smurrffy.github.io']);

async function loadProjects() {
  const grid = document.getElementById('projects-grid');

  try {
    const res = await fetch('https://api.github.com/users/smurrffy/repos?sort=updated&per_page=30');
    if (!res.ok) throw new Error('GitHub API error');
    const repos = await res.json();

    const filtered = repos
      .filter(r => !r.fork && !EXCLUDED.has(r.name))
      .sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 8);

    if (filtered.length === 0) {
      grid.innerHTML = '<p class="error-state">No public repositories found yet. Check back soon!</p>';
      return;
    }

    grid.innerHTML = filtered.map((repo, i) => {
      const colour = repo.language ? (langColours[repo.language] ?? '#7a7890') : null;
      const desc   = repo.description ? escapeHtml(repo.description) : 'No description provided.';
      const delay  = (i % 4) + 1;

      return `
        <a class="project-card reveal" data-delay="${delay}" href="${escapeHtml(repo.html_url)}" target="_blank" rel="noopener">
          <div class="project-card-header">
            <i class="fas fa-book"></i>
            <span class="project-name">${escapeHtml(repo.name)}</span>
          </div>
          <p class="project-desc">${desc}</p>
          <div class="project-meta">
            ${colour ? `<span><span class="lang-dot" style="background:${colour}"></span>${escapeHtml(repo.language)}</span>` : ''}
            ${repo.stargazers_count > 0 ? `<span><i class="fas fa-star" style="color:#c4a24a"></i> ${repo.stargazers_count}</span>` : ''}
            ${repo.forks_count > 0 ? `<span><i class="fas fa-code-fork"></i> ${repo.forks_count}</span>` : ''}
          </div>
        </a>`;
    }).join('');

    // Observe newly injected cards for scroll reveal
    grid.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  } catch {
    grid.innerHTML = `
      <p class="error-state">
        Could not load repositories. View them directly on
        <a href="https://github.com/smurrffy" target="_blank" rel="noopener">GitHub</a>.
      </p>`;
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

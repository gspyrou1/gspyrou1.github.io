// Set footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Language colour map (subset of GitHub's colours)
const langColours = {
  Python:     '#3572A5',
  JavaScript: '#f1e05a',
  TypeScript: '#2b7489',
  Jupyter:    '#DA5B0B',
  'Jupyter Notebook': '#DA5B0B',
  C:          '#555555',
  'C++':      '#f34b7d',
  Java:       '#b07219',
  Go:         '#00ADD8',
  Rust:       '#dea584',
  HTML:       '#e34c26',
  CSS:        '#563d7c',
  Shell:      '#89e051',
  R:          '#198CE7',
};

async function loadProjects() {
  const grid = document.getElementById('projects-grid');

  try {
    const res = await fetch('https://api.github.com/users/smurrffy/repos?sort=updated&per_page=20');
    if (!res.ok) throw new Error('GitHub API error');
    const repos = await res.json();

    // Filter out forked repos and the profile README repo
    const filtered = repos
      .filter(r => !r.fork && r.name !== 'smurrffy')
      .sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 8);

    if (filtered.length === 0) {
      grid.innerHTML = '<p class="error-state">No public repositories found yet. Check back soon!</p>';
      return;
    }

    grid.innerHTML = filtered.map(repo => {
      const colour = repo.language ? (langColours[repo.language] || '#8b8b8b') : '#8b8b8b';
      const desc   = repo.description ? escapeHtml(repo.description) : 'No description provided.';
      const stars  = repo.stargazers_count;
      const forks  = repo.forks_count;

      return `
        <a class="project-card" href="${repo.html_url}" target="_blank" rel="noopener">
          <div class="project-card-header">
            <i class="fas fa-book"></i>
            <span class="project-name">${escapeHtml(repo.name)}</span>
          </div>
          <p class="project-desc">${desc}</p>
          <div class="project-meta">
            ${repo.language ? `<span><span class="lang-dot" style="background:${colour}"></span>${escapeHtml(repo.language)}</span>` : ''}
            ${stars > 0 ? `<span><i class="fas fa-star" style="color:#e3b341"></i> ${stars}</span>` : ''}
            ${forks > 0 ? `<span><i class="fas fa-code-fork"></i> ${forks}</span>` : ''}
          </div>
        </a>`;
    }).join('');

  } catch {
    grid.innerHTML = `
      <p class="error-state">
        Could not load repositories. View them directly on
        <a href="https://github.com/smurrffy" target="_blank" rel="noopener">GitHub</a>.
      </p>`;
  }
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Active nav link on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a => a.classList.remove('active'));
      const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => observer.observe(s));

loadProjects();

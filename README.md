# gspyrou1.github.io

Personal academic page for George Spyrou — [gspyrou1.github.io](https://gspyrou1.github.io).

Static HTML, CSS and a small amount of JavaScript. No build step and no dependencies:
pushing to `main` deploys via GitHub Pages.

```
index.html            all page content
assets/css/style.css  single stylesheet
assets/js/main.js     footer year + active nav link
assets/cv.pdf         CV, compiled from cv.tex
cv.tex                CV source
```

To preview locally, run `python3 -m http.server` in the repo root and open
<http://localhost:8000>.

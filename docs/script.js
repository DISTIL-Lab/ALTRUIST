'use strict';
document.documentElement.classList.add('js');

const themeButton = document.getElementById('theme-toggle');
const themeLabel = document.getElementById('theme-label');
const themeIcon = document.getElementById('theme-icon');
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
let manualTheme = false;
try { manualTheme = ['light', 'dark'].includes(localStorage.getItem('altruist-theme')); } catch {}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const dark = theme === 'dark';
  themeLabel.textContent = dark ? 'Light mode' : 'Dark mode';
  themeIcon.textContent = dark ? '☀' : '◐';
  themeButton.setAttribute('aria-label', dark ? 'Use light mode' : 'Use dark mode');
  themeButton.setAttribute('aria-pressed', String(dark));
}
setTheme(document.documentElement.dataset.theme || (systemTheme.matches ? 'dark' : 'light'));
themeButton.hidden = false;
themeButton.addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  manualTheme = true;
  setTheme(theme);
  try { localStorage.setItem('altruist-theme', theme); } catch {}
});
systemTheme.addEventListener('change', event => {
  if (!manualTheme) setTheme(event.matches ? 'dark' : 'light');
});

const contentsButton = document.getElementById('contents-toggle');
const sidebar = document.getElementById('contents');
const smallScreen = window.matchMedia('(max-width: 760px)');
contentsButton.hidden = false;
function setContents(open) {
  sidebar.classList.toggle('is-open', open);
  contentsButton.setAttribute('aria-expanded', String(open));
  contentsButton.textContent = open ? 'Close contents' : 'Contents';
}
contentsButton.addEventListener('click', () => setContents(!sidebar.classList.contains('is-open')));
smallScreen.addEventListener('change', () => setContents(false));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && smallScreen.matches && sidebar.classList.contains('is-open')) {
    setContents(false);
    contentsButton.focus();
  }
});
document.addEventListener('click', event => {
  if (smallScreen.matches && !sidebar.contains(event.target) && !contentsButton.contains(event.target)) setContents(false);
});

const chapterLinks = Array.from(sidebar.querySelectorAll('nav a[href^="#"]'));
const linkedSections = chapterLinks.map(link => document.getElementById(link.hash.slice(1))).filter(Boolean);
function markCurrent(id) {
  chapterLinks.forEach(link => {
    if (link.hash === '#' + id) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
chapterLinks.forEach(link => link.addEventListener('click', () => {
  markCurrent(link.hash.slice(1));
  if (smallScreen.matches) {
    setContents(false);
    const target = document.getElementById(link.hash.slice(1));
    if (target) {
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
  }
}));
let scheduled = false;
function updateCurrentSection() {
  let current = linkedSections[0];
  for (const section of linkedSections) {
    if (section.getBoundingClientRect().top <= 145) current = section;
  }
  if (current) markCurrent(current.id);
  scheduled = false;
}
window.addEventListener('scroll', () => {
  if (!scheduled) { scheduled = true; requestAnimationFrame(updateCurrentSection); }
}, { passive: true });
window.addEventListener('hashchange', () => markCurrent(location.hash.slice(1)));
updateCurrentSection();

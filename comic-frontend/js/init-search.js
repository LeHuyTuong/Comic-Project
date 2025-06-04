// js/init-search.js
import { loadComponent } from './main.js';
import { initSearchPage } from './search.js';

window.addEventListener('DOMContentLoaded', async () => {
  await loadComponent('components/navbar.html', 'navbar-placeholder');
  await loadComponent('components/footer.html', 'footer-placeholder');
  initSearchPage(); // Gọi đúng entry point của search page
});


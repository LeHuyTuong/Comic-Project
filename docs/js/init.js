import { loadComponent } from './main.js';
import { initHomePage } from './home.js';

window.addEventListener('DOMContentLoaded', async () => {
  await loadComponent('components/navbar.html', 'navbar-placeholder');
  await loadComponent('components/footer.html', 'footer-placeholder'); 
    initHomePage();
  
});


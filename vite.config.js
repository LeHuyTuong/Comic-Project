import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  base: '/comic-frontend/', // nếu deploy ở subfolder (GitHub Pages)
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        category: path.resolve(__dirname, 'category.html'),
        search: path.resolve(__dirname, 'search.html'),
        'comic-detail': path.resolve(__dirname, 'comic-detail.html'),
        'chapter-reader': path.resolve(__dirname, 'chapter-reader.html'),
      }
    }
  }
});

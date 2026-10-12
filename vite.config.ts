import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  build: { rolldownOptions: { output: { codeSplitting: { groups: [
    { name: 'firestore', test: /[\\/]node_modules[\\/]@firebase[\\/]firestore[\\/]/, priority: 30 },
    { name: 'firebase', test: /[\\/]node_modules[\\/](?:firebase|@firebase)[\\/]/, priority: 20 },
    { name: 'vendor', test: /[\\/]node_modules[\\/]/, priority: 0 }
  ] } } } }
});

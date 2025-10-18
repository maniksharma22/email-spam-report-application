// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // CRITICAL FIX: Set the base path to relative './'
  // This tells Vite to use relative paths for assets during the 
  // production build, which resolves 'Failed to resolve' errors 
  // on environments like Render.
  base: './', 
})

// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Keep the critical base setting
  base: './', 
  
  // 🎯 CRITICAL FIX: Add the preview configuration
  preview: {
    // Allows access from your specific Render URL
    allowedHosts: [
        'email-spam-report-application.onrender.com' 
    ],
    // Ensure this remains to bind to all interfaces
    host: '0.0.0.0', 
    // And listen on the Render port
    port: process.env.PORT || 4173 
  }
})
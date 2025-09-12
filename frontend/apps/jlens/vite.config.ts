import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // Add this import
 
export default defineConfig({
  server: {
    host: true,
    port: 3000, // change this to your desired port
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/actions": path.resolve(__dirname,"./src/actions"),
      "@/auth": path.resolve(__dirname, "./src/auth"),
      "@/lib": path.resolve(__dirname, "./src/lib"),
      '@ui': path.resolve(__dirname, '../../packages/ui/dist')
      // Add other aliases as needed
    },
  },
})
 
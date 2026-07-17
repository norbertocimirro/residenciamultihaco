import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Portal COREMU',
        short_name: 'COREMU',
        description: 'Plataforma de Gestão de Residências em Saúde',
        theme_color: '#0f766e', // Cor Teal do Tailwind para combinar com a interface
        background_color: '#f8fafc',
        display: 'standalone', // Faz rodar em tela cheia como um app nativo
        icons: [
          {
            src: 'https://cdn-icons-png.flaticon.com/512/2966/2966327.png', // Um ícone médico temporário
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})

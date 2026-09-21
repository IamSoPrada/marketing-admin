import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  srcDir: 'src/',
  alias: {
    '@': fileURLToPath(new URL('./src', import.meta.url)),
    '~': fileURLToPath(new URL('.', import.meta.url))
  },
  modules: ['@pinia/nuxt'],
  typescript: {
    strict: true,
    typeCheck: false
  },
  pinia: {
    storesDirs: ['src/common/**/state/**', 'src/modules/**/shared/state/**']
  },
  css: ['@/assets/css/tailwind.css'],
  vite: {
    plugins: [tailwindcss()]
  },
  app: {
    head: {
      title: 'Playmarket Admin',
      htmlAttrs: { lang: 'ru' },
      script: [
        {
          // Применяем сохранённую/системную тему до первой отрисовки, чтобы не было вспышки светлой темы
          innerHTML:
            "try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}"
        }
      ]
    }
  },
  nitro: {
    output: {
      // Статическая сборка (`npm run build` → nuxt generate) кладётся в dist/
      publicDir: fileURLToPath(new URL('./dist', import.meta.url))
    },
    prerender: {
      crawlLinks: true,
      routes: [
        '/',
        '/overview',
        '/collections',
        '/collections/new',
        '/collections/col-1/edit',
        '/collections/col-2/edit',
        '/collections/col-3/edit',
        '/collections/col-4/edit',
        '/employees',
        '/roles',
        '/settings',
        '/profile',
        '/sign-in',
        '/sign-up',
        '/two-factor',
        '/forgot-password'
      ],
      failOnError: false
    }
  }
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  console.log('CheckWX API Key:', env.VITE_CHECKWX_API_KEY ? 'Found' : 'Not found')
  
  return {
    plugins: [react()],
    css: {
      postcss: './postcss.config.js',
    },
    server: {
      proxy: {
        '/api/checkwx': {
          target: 'https://api.checkwx.com',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api\/checkwx/, ''),
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, res) => {
              const apiKey = env.VITE_CHECKWX_API_KEY
              if (!apiKey) {
                console.error('CheckWX API Key not found in environment variables!')
                return
              }
              proxyReq.setHeader('X-API-Key', apiKey);
              console.log('Sending Request to:', proxyReq.path);
              console.log('API Key present:', !!apiKey);
            });
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('Received Response Status:', proxyRes.statusCode);
              proxyRes.headers['Access-Control-Allow-Origin'] = '*';
              proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
              proxyRes.headers['Access-Control-Allow-Headers'] = 'X-API-Key,Content-Type';
            });
          },
        },
        '/api/avwx': {
          target: 'https://avwx.rest/api',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api\/avwx/, '')
        },
        '/api/faa': {
          target: 'https://external-api.faa.gov/weather',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api\/faa/, '')
        }
      }
    }
  }
})

import { defineConfig,loadEnv } from 'vite'
import path from 'node:path'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';

import { createSvgIconsPlugin } from "vite-plugin-svg-icons";

// https://vite.dev/config/
export default defineConfig(({mode})=>{
  const env = loadEnv(mode, process.cwd());
  return {
    plugins: [vue(),
      Components({
        resolvers: [
          AntDesignVueResolver({
            importStyle: false, // css in js
          }),
        ],
      }),createSvgIconsPlugin({
        iconDirs: [path.resolve(process.cwd(), "src/assets/icons")],
        symbolId: "icon-[dir]-[name]",
      })
    ],
    resolve:{
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.vue'],
      alias:{
        "@":path.resolve(__dirname,'src'),
        "@Request":path.resolve(__dirname,'src/api')
      }
    },
    server: {
      // 代理配置，用于重定向请求到其他服务器
      host:'0.0.0.0',
      proxy: {
        '/api': {
          // 目标服务器的地址
          // target: 'http://192.168.31.98:8000/',
          // target: 'http://192.168.31.59:8000/',
          // target: 'http://222.94.108.86:5173/',
          target: 'http://localhost:3000/',
          // 更改请求的origin为代理服务器的origin，以便与目标服务器交互
          changeOrigin: true,
          // 重写请求路径，移除/hello-world前缀
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    build: {
      sourcemap: false,
      minify: 'terser',
      terserOptions: {
          compress: {
              drop_console: true,
              drop_debugger: true,
          },
      },
  }
  }
})

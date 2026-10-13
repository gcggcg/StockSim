import path from "path"
import react from "@vitejs/plugin-react"
import {defineConfig} from "vite"
import sourceIdentifierPlugin from 'vite-plugin-source-identifier'

const isProd = process.env.BUILD_MODE === 'prod'
export default defineConfig({
    server: {
        host: '0.0.0.0', // 允许所有IP访问
        port: 8088,      // 默认端口
        strictPort: false // 端口被占用时自动切换
    },
    plugins: [
        react(),
        sourceIdentifierPlugin({
            enabled: !isProd,
            attributePrefix: 'data-matrix',
            includeProps: true,
        })
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
})

import { defineConfig } from 'umi';
import path from 'path';
const px2vw = require('postcss-px-to-viewport');

export default defineConfig({
  title: '情绪指标',
  links: [{ rel: 'icon', href: '/favicon.webp' }],
  metas: [
    { name: 'theme-color', content: '#ff0000' },
  ],
  routes: [
    { path: '/', component: 'index' },
    { path: '/docs', component: 'docs' },
  ],
  npmClient: 'pnpm',
  presets: [],
  alias: {
    '@': path.resolve(__dirname, 'src'),
  },
  extraPostCSSPlugins: [
    px2vw({
      viewportWidth: 375 * 2, // 设计稿宽度
      viewportHeight: 667 * 2, // 设计稿高度
      unitPrecision: 3, // 转换后的精度，保留3位小数
      viewportUnit: 'vw', // 转换的单位，使用vw
      selectorBlackList: ['.ignore'], // 不需要转换的类名
      minPixelValue: 1, // 最小的转换数值
      mediaQuery: false, // 是否允许在媒体查询中转换px
    }),
  ],
});

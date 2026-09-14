import { defineConfig } from 'tsdown'
import packageJson from './package.json' with { type: 'json' };

const banner = `// ==UserScript==
// @name         スクーリング日程を.icsファイルに書き出してくれるツール
// @namespace    ${packageJson.homepage}
// @license      ${packageJson.license}
// @supportURL   ${packageJson.bugs.url}
// @updateURL    https://amasecocoa.github.io/nnn-ical/script.user.js
// @downloadURL  https://amasecocoa.github.io/nnn-ical/script.user.js
// @version      ${packageJson.version}
// @description  ${packageJson.description}
// @author       ${packageJson.author}
// @run-at       context-menu
// @grant        none
// @match        https://secure.nnn.ed.jp/mypage/schooling/*
// @match        https://s-secure.nnn.ed.jp/mypage/schooling/*
// @match        https://r-secure.nnn.ed.jp/mypage/schooling/*
// ==/UserScript==
`

export default defineConfig({
  entry: ['./src/index.ts'],
  outDir: './dist',
  format: 'iife',

  outputOptions(options) {
    options.entryFileNames = 'script.user.js'
    options.banner = banner
    return options
  },

  dts: false,
  clean: true,
})

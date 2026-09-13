import { defineConfig } from 'tsdown'

const banner = `// ==UserScript==
// @name         スクーリング日程を.icsファイルに書き出してくれるツール
// @namespace    https://github.com/AmaseCocoa/nnn-ical
// @version      0.2.0
// @description  スクーリング日程をical形式に変換して読み込めるようにするツールです
// @author       AmaseCocoa
// @match        https://secure.nnn.ed.jp/mypage/schooling/*
// @match        https://s-secure.nnn.ed.jp/mypage/schooling/*
// @match        https://r-secure.nnn.ed.jp/mypage/schooling/*
// @run-at       context-menu
// @grant        none
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

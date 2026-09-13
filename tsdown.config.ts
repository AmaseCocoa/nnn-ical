import { defineConfig } from 'tsdown'

const banner = `// ==UserScript==
// @name         スクーリング日程を.icsファイルに書き出してくれるツール
// @namespace    https://github.com/AmaseCocoa/nnn-ical
// @version      0.1.0
// @description  tsdownを使った快適なTypeScript開発環境
// @author       YourName
// @match        https://secure.nnn.ed.jp*
// @match        https://*-secure.nnn.ed.jp/*
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

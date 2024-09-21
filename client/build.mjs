#!/usr/bin/env node

import esbuild from 'esbuild';
import babel from 'esbuild-plugin-babel';

esbuild.build({
  define: { 'process.env.NODE_ENV': '"production"' },
  outdir: 'static/js',
  entryPoints: [
    './client/code-mirror.mjs'
  ],
  entryNames: '[dir]/[name]-[hash]',
  target: ['es6'],
  format: 'esm',
  platform: 'browser',
  bundle: true,
  minify: true,
  keepNames: true,
  sourcemap: 'linked',
  plugins: [
    babel({
      filter: /\.m?js$/,
      configFile: './babel.config.json'
    })
  ]
}).catch(() => process.exit(1));

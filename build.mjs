import { build } from 'esbuild';

await build({
  entryPoints: {
    'albert-date-picker': 'src/index.ts',
    'albert-date-picker-angular': 'src/angular/index.ts',
  },
  bundle: true,
  format: 'esm',
  outdir: 'dist',
  splitting: true,
  sourcemap: true,
  target: ['es2020'],
  external: ['@angular/core', '@angular/forms', '@angular/common'],
  minify: false,
});

console.log('Build complete ✓');
